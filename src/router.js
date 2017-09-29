const _ = require('lodash');
const Joi = require('joi');
const validate = require('express-validation');
const express = require('express');
const pdf = require('./http/pdf-http');
const config = require('./config');
const logger = require('./util/logger')(__filename);
const { renderQueryParams, renderBodyParams } = require('./util/validation');

function createRouter() {
  const router = express.Router();

  if (!_.isEmpty(config.API_TOKENS)) {
    logger.info('x-api-key authentication required');

    router.use('/*', (req, res, next) => {
      const userToken = req.headers['x-api-key'];
      if (!_.includes(validTokens, userToken)) {
        const err = new Error('Invalid API token in x-api-key header.');
        err.status = 401;
        return next(err);
      }

      return next();
    });
  } else {
    logger.warn('Warning: no authentication required to use the API');
  }

  const getRenderSchema = {
    query: renderQueryParams,
    options: {
      allowUnknownBody: false,
      allowUnknownQuery: false,
    },
  };
  router.get('/api/render', validate(getRenderSchema), pdf.getRender);

  const postRenderSchema = {
    body: renderBodyParams,
    options: {
      allowUnknownBody: false,
      allowUnknownQuery: false,
    },
  };
  router.post('/api/render', validate(postRenderSchema), pdf.postRender);

  return router;
}

module.exports = createRouter;
