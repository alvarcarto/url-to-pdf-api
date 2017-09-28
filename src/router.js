const _ = require('lodash');
const Joi = require('joi');
const validate = require('express-validation');
const express = require('express');
const pdf = require('./http/pdf-http');
const { renderQueryParams, renderBodyParams } = require('./util/validation');

function createRouter() {
  const router = express.Router();

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
