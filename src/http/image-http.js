const _ = require('lodash');
const ex = require('../util/express');
const imageCore = require('../core/image-core');

const getRender = ex.createRoute((req, res) => {
  const opts = getOptsFromQuery(req.query);
  return imageCore.render(opts)
    .then((data) => {
      if (opts.attachmentName) {
        res.attachment(opts.attachmentName);
      }
      res.set('content-type', 'image/' + (!opts.image.type ? 'png' : opts.image.type));
      res.send(data);
    });
});

const postRender = ex.createRoute((req, res) => {
  const isBodyJson = req.headers['content-type'] === 'application/json';
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
    opts = _.cloneDeep(req.body);
  } else {
    opts = getOptsFromQuery(req.query);
    opts.html = req.body;
  }

  return imageCore.render(opts)
    .then((data) => {
      if (opts.attachmentName) {
        res.attachment(opts.attachmentName);
      }
      res.set('content-type', 'image/' + (!opts.image.type ? 'png' : opts.image.type));
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
    image: {
      type: query['image.type'],
      quality: query['image.quality'],
      fullPage: query['image.fullpage'],
      clip: {
        x: query['image.clip.x'],
        y: query['image.clip.y'],
        width: query['image.clip.width'],
        height: query['image.clip.height'],
      },
      omitBackground: query['image.omitBackground'],
    },
  };
  return opts;
}

module.exports = {
  getRender,
  postRender,
};
