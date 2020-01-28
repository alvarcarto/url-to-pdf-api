const _ = require('lodash');
const ex = require('../util/express');
const renderCore = require('../core/render-core');

function getMimeType(opts) {
  if (opts.output === 'pdf') {
    return 'application/pdf';
  } else if (opts.output === 'html') {
    return 'text/html';
  }

  const type = _.get(opts, 'screenshot.type');
  switch (type) {
    case 'png': return 'image/png';
    case 'jpeg': return 'image/jpeg';
    default: throw new Error(`Unknown screenshot type: ${type}`);
  }
}

const getRender = ex.createRoute((req, res) => {
  const opts = getOptsFromQuery(req.query);
  return renderCore.render(opts)
    .then((data) => {
      if (opts.attachmentName) {
        res.attachment(opts.attachmentName);
      }
      res.set('content-type', getMimeType(opts));
      res.send(data);
    });
});

const postRender = ex.createRoute((req, res) => {
  const isBodyJson = req.headers['content-type'].includes('application/json');
  if (isBodyJson) {
    const hasContent = _.isString(_.get(req.body, 'url')) || _.isString(_.get(req.body, 'html'));
    if (!hasContent) {
      ex.throwStatus(400, 'Body must contain url or html');
    }
  } else if (_.isString(req.query.url)) {
    ex.throwStatus(400, 'url query parameter is not allowed when body is HTML');
  }

  let opts;
  if (isBodyJson) {
    opts = _.merge({
      output: 'pdf',
      screenshot: {
        type: 'png',
      },
    }, req.body);
  } else {
    opts = getOptsFromQuery(req.query);
    opts.html = req.body;
  }

  return renderCore.render(opts)
    .then((data) => {
      if (opts.attachmentName) {
        res.attachment(opts.attachmentName);
      }
      res.set('content-type', getMimeType(opts));
      res.send(data);
    });
});

function getOptsFromQuery(query) {
  const opts = {
    url: query.url,
    attachmentName: query.attachmentName,
    scrollPage: query.scrollPage,
    emulateScreenMedia: query.emulateScreenMedia,
    ignoreHttpsErrors: query.ignoreHttpsErrors,
    waitFor: query.waitFor,
    output: query.output || 'pdf',
    viewport: {
      width: query['viewport.width'],
      height: query['viewport.height'],
      deviceScaleFactor: query['viewport.deviceScaleFactor'],
      isMobile: query['viewport.isMobile'],
      hasTouch: query['viewport.hasTouch'],
      isLandscape: query['viewport.isLandscape'],
    },
    goto: {
      timeout: query['goto.timeout'],
      waitUntil: query['goto.waitUntil'],
      networkIdleInflight: query['goto.networkIdleInflight'],
      networkIdleTimeout: query['goto.networkIdleTimeout'],
    },
    pdf: {
      scale: query['pdf.scale'],
      displayHeaderFooter: query['pdf.displayHeaderFooter'],
      footerTemplate: query['pdf.footerTemplate'],
      headerTemplate: query['pdf.headerTemplate'],
      landscape: query['pdf.landscape'],
      pageRanges: query['pdf.pageRanges'],
      format: query['pdf.format'],
      width: query['pdf.width'],
      height: query['pdf.height'],
      margin: {
        top: query['pdf.margin.top'],
        right: query['pdf.margin.right'],
        bottom: query['pdf.margin.bottom'],
        left: query['pdf.margin.left'],
      },
      printBackground: query['pdf.printBackground'],
    },
    screenshot: {
      fullPage: query['screenshot.fullPage'],
      quality: query['screenshot.quality'],
      type: query['screenshot.type'] || 'png',
      clip: {
        x: query['screenshot.clip.x'],
        y: query['screenshot.clip.y'],
        width: query['screenshot.clip.width'],
        height: query['screenshot.clip.height'],
      },
      omitBackground: query['screenshot.omitBackground'],
    },
  };
  return opts;
}

module.exports = {
  getRender,
  postRender,
};
