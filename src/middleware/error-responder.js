const http = require('http');
const _ = require('lodash');

// This reponder is assuming that all <500 errors are safe to be responded
// with their .message attribute.
// DO NOT write sensitive data into error messages.
function createErrorResponder(_opts) {
  const opts = _.merge({
    isErrorSafeToRespond: status => status < 500,
  }, _opts);

  // 4 params needed for Express to know it's a error handler middleware
  // eslint-disable-next-line
  return function errorResponder(err, req, res, next) {
    let message;
    let status = err.status ? err.status : 500;
    switch (err.type) {
      case 'StripeCardError':
        // A declined card error
        status = 402;
        break;
      case 'StripeInvalidRequestError':
        status = 402;
        break;
      case 'StripeConnectionError':
        status = 503;
        break;
      case 'StripeRateLimitError':
        status = 429;
        break;
      default:
        break;
    }

    const httpMessage = http.STATUS_CODES[status];
    if (opts.isErrorSafeToRespond(status)) {
      // eslint-disable-next-line
      message = err.message;
    } else {
      message = httpMessage;
    }

    const isPrettyValidationErr = _.has(err, 'errors');
    const body = isPrettyValidationErr
      ? JSON.stringify(err)
      : { status, statusText: httpMessage, messages: [message] };

    res.status(status);
    res.send(body);
  };
}

module.exports = createErrorResponder;
