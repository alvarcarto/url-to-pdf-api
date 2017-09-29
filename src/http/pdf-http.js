const ex = require('../util/express');
const pdfCore = require('../core/pdf-core');

const getRender = ex.createRoute((req, res) => {
  const opts = {
    url: req.query.url,
    scrollPage: req.query.scrollPage,
    emulateScreenMedia: req.query.emulateScreenMedia,
    waitFor: req.query.waitFor,
    viewport: {
      width: req.query['viewport.width'],
      height: req.query['viewport.height'],
      deviceScaleFactor: req.query['viewport.deviceScaleFactor'],
      isMobile: req.query['viewport.isMobile'],
      hasTouch: req.query['viewport.hasTouch'],
      isLandscape: req.query['viewport.isLandscape'],
    },
    goto: {
      timeout: req.query['goto.timeout'],
      waitUntil: req.query['goto.waitUntil'],
      networkIdleInflight: req.query['goto.networkIdleInflight'],
      networkIdleTimeout: req.query['goto.networkIdleTimeout'],
    },
    pdf: {
      scale: req.query['pdf.scale'],
      displayHeaderFooter: req.query['pdf.displayHeaderFooter'],
      landscape: req.query['pdf.landscape'],
      pageRanges: req.query['pdf.pageRanges'],
      format: req.query['pdf.format'],
      width: req.query['pdf.width'],
      height: req.query['pdf.height'],
      margin: {
        top: req.query['pdf.margin.top'],
        right: req.query['pdf.margin.right'],
        bottom: req.query['pdf.margin.bottom'],
        left: req.query['pdf.margin.left'],
      },
      printBackground: req.query['pdf.printBackground'],
    },
  };

  return pdfCore.render(opts)
    .then((data) => {
      res.set('content-type', 'application/pdf');
      res.send(data);
    });
});

const postRender = ex.createRoute((req, res) => {
  return pdfCore.render(req.body)
    .then((data) => {
      res.set('content-type', 'application/pdf');
      res.send(data);
    });
});

module.exports = {
  getRender,
  postRender
};
