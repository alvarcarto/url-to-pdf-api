const _ = require('lodash');
const Joi = require('joi');
const validate = require('express-validation');
const express = require('express');
const pdf = require('./http/pdf-http');
const { renderQueryParams } = require('./util/validation');

function createRouter() {
  const router = express.Router();

  const getRenderSchema = {
    query: renderQueryParams,
  };
  router.get('/api/render', validate(getRenderSchema), pdf.getRender);

  return router;
}

module.exports = createRouter;
