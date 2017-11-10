const _ = require('lodash');
const validate = require('express-validation');
const express = require('express');
const pdf = require('./http/pdf-http');
const image = require('./http/image-http');
const config = require('./config');
const logger = require('./util/logger')(__filename);
const { renderQuerySchema, renderBodySchema, sharedQuerySchema } = require('./util/validation');

function createRouter() {
  const router = express.Router();

  if (!_.isEmpty(config.API_TOKENS)) {
    logger.info('x-api-key authentication required');

    router.use('/*', (req, res, next) => {
      const userToken = req.headers['x-api-key'];
      if (!_.includes(config.API_TOKENS, userToken)) {
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
    query: renderQuerySchema,
    options: {
      allowUnknownBody: false,
      allowUnknownQuery: false,
    },
  };
  router.get('/api/pdf/render', validate(getRenderSchema), pdf.getRender);
  router.get('/api/image/render', validate(getRenderSchema), image.getRender);

  const postRenderSchema = {
    body: renderBodySchema,
    query: sharedQuerySchema,
    options: {
      allowUnknownBody: false,
      allowUnknownQuery: false,

      // Without this option, text body causes an error
      // https://github.com/AndrewKeig/express-validation/issues/36
      contextRequest: true,
    },
  };
  router.post('/api/pdf/render', validate(postRenderSchema), pdf.postRender);
  router.post('/api/image/render', validate(postRenderSchema), image.postRender);

  return router;
}

module.exports = createRouter;
