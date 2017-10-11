const puppeteer = require('puppeteer');
const BPromise = require('bluebird');
const _ = require('lodash');
const logger = require('../util/logger')(__filename);

// Initialize a Chrome instance
let browser;

(async () => {
  browser = await puppeteer.launch({
    headless: true,
    args: ['--disable-gpu', '--no-sandbox', '--disable-setuid-sandbox'],
  });
})();

process.on("exit", () => browser.close()); // Safe-guard to kill the Chrome instance

// Initialize the Pool array
const PagePool = [];
const MAX_POOL_SIZE = process.env.MAX_POOL_SIZE || 4; // Defaults to 4

async function render(_opts = {}) {
  const opts = _.merge({
    scrollPage: false,
    emulateScreenMedia: true,
    html: null,
    viewport: {
      width: 1600,
      height: 1200,
    },
    goto: {
      waitUntil: 'networkidle',
      networkIdleTimeout: 2000,
    },
    pdf: {
      format: 'A4',
      printBackground: true,
    },
  }, _opts);

  if (_.get(_opts, 'pdf.width') && _.get(_opts, 'pdf.height')) {
    // pdf.format always overrides width and height, so we must delete it
    // when user explicitly wants to set width and height
    opts.pdf.format = undefined;
  }

  logger.info(`Rendering with opts: ${JSON.stringify(opts, null, 2)}`);

  let page = pool_getConnection(); // page = Page instance OR null
  
  if(!page){
    page = await pool_addConnection();
  }

  page.on('console', (...args) => logger.info('PAGE LOG:', ...args));

  page.on('error', (err) => {
    logger.error(`Error event emitted: ${err}`);
    logger.error(err.stack);
    browser.close();
  });

  let data;
  try {
    logger.info('Set browser viewport..');
    await page.setViewport(opts.viewport);
    if (opts.emulateScreenMedia) {
      logger.info('Emulate @media screen..');
      await page.emulateMedia('screen');
    }

    if (opts.html) {
      logger.info(`Set HTML ..`);
      await page.setContent(opts.html);
    } else {
      logger.info(`Goto url ${opts.url} ..`);
      await page.goto(opts.url, opts.goto);
    }

    if (_.isNumber(opts.waitFor) || _.isString(opts.waitFor)) {
      logger.info(`Wait for ${opts.waitFor} ..`);
      await page.waitFor(opts.waitFor);
    }

    if (opts.scrollPage) {
      logger.info(`Scroll page ..`);
      await scrollPage(page);
    }

    logger.info(`Render PDF ..`);
    data = await page.pdf(opts.pdf);
  } catch (err) {
    logger.error(`Error when rendering page: ${err}`);
    logger.error(err.stack);
    throw err;
  }

  pool_toggleAvailability(page.pool.id);
  return data;
}

async function scrollPage(page) {
  // Scroll to page end to trigger lazy loading elements
  return await page.evaluate(() => {
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

function pool_getConnection(){
  let returnValue;

  for(let i = 0; i < PagePool.length; i++){
    if(PagePool[i].pool.available === true){
      returnValue = PagePool[i];
      PagePool[i].pool.available = false; // Set to false so cannot be accessed by others
    }
  }

  return returnValue || null;
};

async function pool_addConnection(){
  // Check so adding wont surpass limit
	if(PagePool.length + 1 > MAX_POOL_SIZE) throw new Error("Surpassing maximum pool size limit");
  
    // Create the new tab
    const newPage = await browser.newPage();
    newPage.pool = {
      id: PagePool.length + 1,
      available: false
    };
  
    // Add to the pool
    PagePool.push(newPage);
  
    return newPage;
};

function pool_toggleAvailability(id){
  for(let i = 0; i < PagePool.length; i++){
		if(PagePool[i].pool.id === id){
			PagePool[i].pool.available = !PagePool[i].pool.available
		}
	}
};

module.exports = {
  render,
};
