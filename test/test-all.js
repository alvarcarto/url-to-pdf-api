/* eslint-env mocha */

const chai = require('chai');
const fs = require('fs');
const request = require('supertest');
const BPromise = require('bluebird');
const { getResource } = require('./util');
const PDFParser = require('pdf2json');
const createApp = require('../src/app');

const DEBUG = false;

BPromise.config({
  longStackTraces: true,
});

const app = createApp();

function getPdfTextContent(buffer) {
  return new BPromise((resolve, reject) => {
    const pdfParser = new PDFParser();
    pdfParser.on('pdfParser_dataError', (err) => {
      reject(err);
    });
    pdfParser.on('pdfParser_dataReady', () => {
      resolve(pdfParser.getRawTextContent());
    });

    pdfParser.parseBuffer(buffer);
  });
}

describe('GET /api/render', function test() {
  this.timeout(1000);

  it('request must have "url" query parameter', () =>
    request(app).get('/api/render').expect(400)
  );

  it('invalid cert should cause an error', () =>
    request(app)
      .get('/api/render')
      .query({
        url: 'https://self-signed.badssl.com/',
      })
      .expect(500)
  );

  it('invalid cert should not cause an error when ignoreHttpsErrors=true', () =>
    request(app)
      .get('/api/render')
      .query({
        url: 'https://self-signed.badssl.com/',
        ignoreHttpsErrors: true,
      })
      .expect(200)
  );
});

describe('POST /api/render', () => {
  it('body must have "url" attribute', () =>
    request(app)
      .post('/api/render')
      .send({
        pdf: { scale: 2 },
      })
      .set('content-type', 'application/json')
      .expect(400)
  );

  it('render github.com should succeed', () =>
    request(app)
      .post('/api/render')
      .send({ url: 'https://github.com' })
      .set('content-type', 'application/json')
      .set('Connection', 'keep-alive')
      .expect(200)
      .expect('content-type', 'application/pdf')
      .then((response) => {
        const length = Number(response.headers['content-length']);
        chai.expect(length).to.be.above(1024 * 40);
      })
  );

  it('html in json body should succeed', () =>
    request(app)
      .post('/api/render')
      .send({ html: getResource('postmark-receipt.html') })
      .set('Connection', 'keep-alive')
      .set('content-type', 'application/json')
      .expect(200)
      .expect('content-type', 'application/pdf')
      .then((response) => {
        const length = Number(response.headers['content-length']);
        chai.expect(length).to.be.above(1024 * 40);
      })
  );

  it('html as text body should succeed', () =>
    request(app)
      .post('/api/render')
      .send(getResource('postmark-receipt.html'))
      .set('Connection', 'keep-alive')
      .set('content-type', 'text/html')
      .expect(200)
      .expect('content-type', 'application/pdf')
      .then((response) => {
        const length = Number(response.headers['content-length']);
        chai.expect(length).to.be.above(1024 * 40);
      })
  );

  /*
  Disabled until we get the setContent API working with waitFor parameters


  it('rendering large html should succeed', () =>
    request(app)
      .post('/api/render')
      .send(getResource('large.html'))
      .set('content-type', 'text/html')
      .expect(200)
      .expect('content-type', 'application/pdf')
      .then((response) => {
        const length = Number(response.headers['content-length']);
        chai.expect(length).to.be.above(1024 * 1024 * 1);
      })
  );
  */

  it('rendering html with large linked images should succeed', () =>
    request(app)
      .post('/api/render')
      .send(getResource('large-linked.html'))
      .set('content-type', 'text/html')
      .expect(200)
      .expect('content-type', 'application/pdf')
      .then((response) => {
        if (DEBUG) {
          console.log(response.headers);
          console.log(response.body);
          fs.writeFileSync('out.pdf', response.body, { encoding: null });
        }

        const length = Number(response.headers['content-length']);
        chai.expect(length).to.be.above(30 * 1024 * 1);
      })
  );

  it('cookies should exist on the page', () =>
    request(app)
      .post('/api/render')
      .send({
        url: 'http://www.html-kit.com/tools/cookietester/',
        cookies:
              [{
                name: 'url-to-pdf-test',
                value: 'test successful',
                domain: 'www.html-kit.com',
              }, {
                name: 'url-to-pdf-test-2',
                value: 'test successful 2',
                domain: 'www.html-kit.com',
              }],
      })
      .set('Connection', 'keep-alive')
      .set('content-type', 'application/json')
      .expect(200)
      .expect('content-type', 'application/pdf')
      .then((response) => {
        if (DEBUG) {
          console.log(response.headers);
          console.log(response.body);
          fs.writeFileSync('cookies-pdf.pdf', response.body, { encoding: null });
        }

        return getPdfTextContent(response.body);
      })
      .then((text) => {
        if (DEBUG) {
          fs.writeFileSync('./cookies-content.txt', text);
        }

        chai.expect(text).to.have.string('Number of cookies received: 2');
        chai.expect(text).to.have.string('Cookie named "url­to­pdf­test"');
        chai.expect(text).to.have.string('Cookie named "url­to­pdf­test­2"');
      })
  );
});
