const Joi = require('joi');

const renderQueryParams = Joi.object({
  url: Joi.string().required(),
}).unknown();

module.exports = {
  renderQueryParams,
};
