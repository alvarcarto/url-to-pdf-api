const _ = require('lodash');
const BPromise = require('bluebird');

// Route which assumes that the Promise `func` returns, will be resolved
// with data which will be sent as json response.
function createJsonRoute(func) {
  return createRoute(func, function sendJsonResponse(data, req, res, next) {
    res.json(data);
  });
}

// Generic route creator
// Factory function to create a new route to reduce boilerplate in controllers
// and make it easier to interact with promises.
// `func` must return a promise
// `responseHandler` receives the data from asynchronous `func` as the first
//                   parameter
// Factory function to create a new 'raw' route handler.
// When using this function directly instead of `createJsonRoute`, you must
// send a response to express' `res` object.
function createRoute(func, responseHandler) {
  return function route(req, res, next) {
    try {
      var callback = _.isFunction(responseHandler) ? func.bind(this, req, res) :
        func.bind(this, req, res, next);

      var valuePromise = callback();
      if (!_.isFunction(_.get(valuePromise, 'then'))) {
        // It was a not a Promise, so wrap it as a Promise
        valuePromise = BPromise.resolve(valuePromise);
      }

      if (_.isFunction(responseHandler)) {
        valuePromise
          .then(function(data) {
            return responseHandler(data, req, res, next);
          })
          .catch(next);
      }
      else {
        valuePromise.catch(next);
      }

    }
    catch (err) {
      next(err);
    }
  };
}

function throwStatus(status, message) {
  const err = new Error(message);
  err.status = status;
  throw err;
}

module.exports = {
  createRoute,
  createJsonRoute,
  throwStatus
};
