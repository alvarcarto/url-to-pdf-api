const { URL } = require('url');
const _ = require('lodash');
const normalizeUrl = require('normalize-url');
const ex = require('../util/express');
const renderCore = require('../core/render-core');
const logger = require('../util/logger')(__filename);
const config = require('../config');

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

  assertOptionsAllowed(opts);
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

  assertOptionsAllowed(opts);
  return renderCore.render(opts)
    .then((data) => {
      if (opts.attachmentName) {
        res.attachment(opts.attachmentName);
      }
      res.set('content-type', getMimeType(opts));
      res.send(data);
    });
});

function isHostMatch(host1, host2) {
  return {
    match: host1.toLowerCase() === host2.toLowerCase(),
    type: 'host',
    part1: host1.toLowerCase(),
    part2: host2.toLowerCase(),
  };
}

function isRegexMatch(urlPattern, inputUrl) {
  const re = new RegExp(`${urlPattern}`);

  return {
    match: re.test(inputUrl),
    type: 'regex',
    part1: inputUrl,
    part2: urlPattern,
  };
}

function isNormalizedMatch(url1, url2) {
  return {
    match: normalizeUrl(url1) === normalizeUrl(url2),
    type: 'normalized url',
    part1: url1,
    part2: url2,
  };
}

function isUrlAllowed(inputUrl) {
  const urlParts = new URL(inputUrl);

  const matchInfos = _.map(config.ALLOW_URLS, (urlPattern) => {
    if (_.startsWith(urlPattern, 'host:')) {
      return isHostMatch(urlPattern.split(':')[1], urlParts.host);
    } else if (_.startsWith(urlPattern, 'regex:')) {
      return isRegexMatch(urlPattern.split(':')[1], inputUrl);
    }

    return isNormalizedMatch(urlPattern, inputUrl);
  });

  const isAllowed = _.some(matchInfos, info => info.match);
  if (!isAllowed) {
    logger.info('The url was not allowed because:');
    _.forEach(matchInfos, (info) => {
      logger.info(`${info.part1} !== ${info.part2} (with ${info.type} matching)`);
    });
  }

  return isAllowed;
}

function assertOptionsAllowed(opts) {
  const isDisallowedHtmlInput = !_.isString(opts.url) && config.DISABLE_HTML_INPUT;
  if (isDisallowedHtmlInput) {
    ex.throwStatus(403, 'Rendering HTML input is disabled.');
  }

  if (_.isString(opts.url) && config.ALLOW_URLS.length > 0 && !isUrlAllowed(opts.url)) {
    ex.throwStatus(403, 'Url not allowed.');
  }
}

function getOptsFromQuery(query) {
  const opts = {
    url: query.url,
    attachmentName: query.attachmentName,
    scrollPage: query.scrollPage,
    emulateScreenMedia: query.emulateScreenMedia,
    enableGPU: query.enableGPU,
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
    },
    pdf: {
      fullPage: query['pdf.fullPage'],
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
      selector: query['screenshot.selector'],
      omitBackground: query['screenshot.omitBackground'],
    },
  };
  return opts;
}

module.exports = {
  getRender,
  postRender,
};
