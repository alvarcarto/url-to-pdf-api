const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const compression = require('compression');
const cors = require('cors');
const logger = require('./util/logger')(__filename);
const errorResponder = require('./middleware/error-responder');
const errorLogger = require('./middleware/error-logger');
const requireHttps = require('./middleware/require-https');
const createRouter = require('./router');
const config = require('./config');

function createApp() {
  const app = express();
  // App is served behind Heroku's router.
  // This is needed to be able to use req.ip or req.secure
  app.enable('trust proxy', 1);
  app.disable('x-powered-by');

  if (config.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
  }

  if (!config.ALLOW_HTTP) {
    logger.info('All requests require HTTPS.');
    app.use(requireHttps());
  } else {
    logger.info('ALLOW_HTTP=true, unsafe requests are allowed. Don\'t use this in production.');
  }

  const corsOpts = {
    origin: config.CORS_ORIGIN,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD', 'PATCH'],
  };
  logger.info('Using CORS options:', corsOpts);
  app.use(cors(corsOpts));

  // Limit to 10mb if HTML has e.g. inline images
  app.use(bodyParser.text({ limit: '10mb', type: 'text/html' }));
  app.use(bodyParser.json({ limit: '10mb' }));

  app.use(compression({
    // Compress everything over 10 bytes
    threshold: 10,
  }));

  // Initialize routes
  const router = createRouter();
  app.use('/', router);

  app.use(errorLogger());
  app.use(errorResponder());

  return app;
}

module.exports = createApp;
