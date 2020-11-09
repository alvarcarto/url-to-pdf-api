const conf = require('../config');

const config = {
  plugins: true,
  logInjection: conf.DD_LOGS_INJECTION === 'true',
  env: conf.TRACING_ENV,
  logger: console.log,
  enabled: conf.TRACING_ENABLED === 'true',
  service: 'joor-pdf',
};

const tracer = require('dd-trace').init(config);

tracer.use('winston', { enabled: config.enabled, service: config.service });

module.exports = tracer;
