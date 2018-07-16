/* eslint-env mocha */

const chai = require('chai');
const supertest = require('supertest');
const { getResource } = require('./util');
const createApp = require('../src/app');

const app = createApp();

const request = supertest(app);

describe('GET /api/render', () => {
  it('request must have "url" query parameter', () =>
    request.get('/api/render').expect(400)
  );

  it('invalid cert should cause an error', () =>
    request
      .get('/api/render')
      .query({
        url: 'https://self-signed.badssl.com/',
      })
      .expect(500)
  );

  it('invalid cert should not cause an error when ignoreHttpsErrors=true', () =>
    request
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
    request
      .post('/api/render')
      .send({
        pdf: { scale: 2 },
      })
      .set('content-type', 'application/json')
      .expect(400)
  );

  it('render google.com should succeed', () =>
    request
      .post('/api/render')
      .send({ url: 'https://google.com' })
      .set('content-type', 'application/json')
      .expect(200)
      .expect('content-type', 'application/pdf')
      .then((response) => {
        const length = Number(response.headers['content-length']);
        chai.expect(length).to.be.above(1024 * 40);
      })
  );

  it('html in json body should succeed', () =>
    request
      .post('/api/render')
      .send({ html: getResource('postmark-receipt.html') })
      .set('content-type', 'application/json')
      .expect(200)
      .expect('content-type', 'application/pdf')
      .then((response) => {
        const length = Number(response.headers['content-length']);
        chai.expect(length).to.be.above(1024 * 40);
      })
  );

  it('html as text body should succeed', () =>
    request
      .post('/api/render')
      .send(getResource('postmark-receipt.html'))
      .set('content-type', 'text/html')
      .expect(200)
      .expect('content-type', 'application/pdf')
      .then((response) => {
        const length = Number(response.headers['content-length']);
        chai.expect(length).to.be.above(1024 * 40);
      })
  );
});
