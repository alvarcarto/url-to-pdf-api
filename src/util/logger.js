const path = require('path');
const winston = require('winston');
const _ = require('lodash');
const config = require('../config');

const COLORIZE = config.NODE_ENV === 'development';

function createLogger(filePath) {
  const fileName = path.basename(filePath);

  const logger = new winston.Logger({
    transports: [new winston.transports.Console({
      colorize: COLORIZE,
      label: fileName,
      timestamp: true,
    })],
  });

  _setLevelForTransports(logger, config.LOG_LEVEL || 'info');
  return logger;
}

function _setLevelForTransports(logger, level) {
  _.each(logger.transports, (transport) => {
    // eslint-disable-next-line
    transport.level = level;
  });
}

module.exports = createLogger;
