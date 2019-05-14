const puppeteer = require('puppeteer');
const _ = require('lodash');
const config = require('../config');
const logger = require('../util/logger')(__filename);

async function render(_opts = {}) {
  const opts = _.merge({
    cookies: [],
    scrollPage: false,
    emulateScreenMedia: true,
    ignoreHttpsErrors: false,
    html: null,
    viewport: {
      width: 1600,
      height: 1200,
    },
    goto: {
      waitUntil: 'networkidle2',
    },
    output: 'pdf',
    pdf: {
      format: 'A4',
      printBackground: true,
    },
    screenshot: {
      type: 'png',
      fullPage: true,
    },
    failEarly: false,
  }, _opts);

  if (_.get(_opts, 'pdf.width') && _.get(_opts, 'pdf.height')) {
    // pdf.format always overrides width and height, so we must delete it
    // when user explicitly wants to set width and height
    opts.pdf.format = undefined;
  }

  logOpts(opts);

  const browser = await puppeteer.launch({
    headless: !config.DEBUG_MODE,
    ignoreHTTPSErrors: opts.ignoreHttpsErrors,
    args: ['--disable-gpu', '--no-sandbox', '--disable-setuid-sandbox'],
    sloMo: config.DEBUG_MODE ? 250 : undefined,
  });
  const page = await browser.newPage();

  page.on('console', (...args) => logger.info('PAGE LOG:', ...args));

  page.on('error', (err) => {
    logger.error(`Error event emitted: ${err}`);
    logger.error(err.stack);
    browser.close();
  });


  this.failedResponses = [];
  page.on('requestfailed', (request) => {
    this.failedResponses.push(request);
    if (request.url === opts.url) {
      this.mainUrlResponse = request;
    }
  });

  page.on('response', (response) => {
    if (response.status >= 400) {
      this.failedResponses.push(response);
    }

    if (response.url === opts.url) {
      this.mainUrlResponse = response;
    }
  });

  let data;
  try {
    logger.info('Set browser viewport..');
    await page.setViewport(opts.viewport);
    if (opts.emulateScreenMedia) {
      logger.info('Emulate @media screen..');
      await page.emulateMedia('screen');
    }

    if (opts.cookies && opts.cookies.length > 0) {
      logger.info('Setting cookies..');

      const client = await page.target().createCDPSession();

      await client.send('Network.enable');
      await client.send('Network.setCookies', { cookies: opts.cookies });
    }

    if (opts.html) {
      logger.info('Set HTML ..');
      await page.setContent(opts.html, opts.goto);
    } else {
      logger.info(`Goto url ${opts.url} ..`);
      await page.goto(opts.url, opts.goto);
    }

    if (_.isNumber(opts.waitFor) || _.isString(opts.waitFor)) {
      logger.info(`Wait for ${opts.waitFor} ..`);
      await page.waitFor(opts.waitFor);
    }

    if (opts.scrollPage) {
      logger.info('Scroll page ..');
      await scrollPage(page);
    }

    if (this.failedResponses.length) {
      logger.warn(`Number of failed requests: ${this.failedResponses.length}`);
      this.failedResponses.forEach((response) => {
        logger.warn(`${response.status} ${response.url}`);
      });

      if (opts.failEarly === 'all') {
        const err = new Error(`${this.failedResponses.length} requests have failed. See server log for more details.`);
        err.status = 412;
        throw err;
      }
    }
    if (opts.failEarly === 'page' && this.mainUrlResponse.status !== 200) {
      const msg = `Request for ${opts.url} did not directly succeed and returned status ${this.mainUrlResponse.status}`;
      const err = new Error(msg);
      err.status = 412;
      throw err;
    }

    logger.info('Rendering ..');
    if (config.DEBUG_MODE) {
      const msg = `\n\n---------------------------------\n
        Chrome does not support rendering in "headed" mode.
        See this issue: https://github.com/GoogleChrome/puppeteer/issues/576
        \n---------------------------------\n\n
      `;
      throw new Error(msg);
    }

    if (opts.output === 'pdf') {
      data = await page.pdf(opts.pdf);
    } else {
      // This is done because puppeteer throws an error if fullPage and clip is used at the same
      // time even though clip is just empty object {}
      const screenshotOpts = _.cloneDeep(_.omit(opts.screenshot, ['clip']));
      const clipContainsSomething = _.some(opts.screenshot.clip, val => !_.isUndefined(val));
      if (clipContainsSomething) {
        screenshotOpts.clip = opts.screenshot.clip;
      }

      data = await page.screenshot(screenshotOpts);
    }
  } catch (err) {
    logger.error(`Error when rendering page: ${err}`);
    logger.error(err.stack);
    throw err;
  } finally {
    logger.info('Closing browser..');
    if (!config.DEBUG_MODE) {
      await browser.close();
    }
  }

  return data;
}

async function scrollPage(page) {
  // Scroll to page end to trigger lazy loading elements
  await page.evaluate(() => {
    const scrollInterval = 100;
    const scrollStep = Math.floor(window.innerHeight / 2);
    const bottomThreshold = 400;

    function bottomPos() {
      return window.pageYOffset + window.innerHeight;
    }

    return new Promise((resolve, reject) => {
      function scrollDown() {
        window.scrollBy(0, scrollStep);

        if (document.body.scrollHeight - bottomPos() < bottomThreshold) {
          window.scrollTo(0, 0);
          setTimeout(resolve, 500);
          return;
        }

        setTimeout(scrollDown, scrollInterval);
      }

      setTimeout(reject, 30000);
      scrollDown();
    });
  });
}

function logOpts(opts) {
  const supressedOpts = _.cloneDeep(opts);
  if (opts.html) {
    supressedOpts.html = '...';
  }

  logger.info(`Rendering with opts: ${JSON.stringify(supressedOpts, null, 2)}`);
}

module.exports = {
  render,
};

