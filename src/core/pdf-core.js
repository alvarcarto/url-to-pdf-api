const fs = require('fs');
const puppeteer = require('puppeteer');
const BPromise = require('bluerbird');
const _ = require('lodash');

BPromise.promisifyAll(fs);

async function render(_opts = {}) {
  const opts = _.merge({
    viewport: {
      width: 1200,
      height: 800,
    },
    goto: {
      waitUntil: 'networkidle',
    },
    pdf: {
      format: 'A4',
    }
  }, _opts);

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport(opts.viewport)
  await page.goto(params.url, opts.goto);
  await page.pdf(_.merge({}, opts.pdf, {
    path: 'page.pdf',
  }));

  await browser.close();

  return fs.readFileAsync('page.pdf', { encoding: null });
}

module.exports = {
  render,
};
