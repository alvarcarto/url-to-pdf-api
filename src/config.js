/* eslint-disable no-process-env */

// Env vars should be casted to correct types
const config = {
  PORT: Number(process.env.PORT) || 9000,
  NODE_ENV: process.env.NODE_ENV,
  LOG_LEVEL: process.env.LOG_LEVEL,
  ALLOW_HTTP: process.env.ALLOW_HTTP === 'true',
  DEBUG_MODE: process.env.DEBUG_MODE === 'true',
  DISABLE_HTML_INPUT: process.env.DISABLE_HTML_INPUT === 'true',
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  BROWSER_WS_ENDPOINT: process.env.BROWSER_WS_ENDPOINT,
  BROWSER_EXECUTABLE_PATH: process.env.BROWSER_EXECUTABLE_PATH,
  API_TOKENS: [],
  ALLOW_URLS: [],
};

if (process.env.API_TOKENS) {
  config.API_TOKENS = process.env.API_TOKENS.split(',');
}

if (process.env.ALLOW_URLS) {
  config.ALLOW_URLS = process.env.ALLOW_URLS.split(',');
}

module.exports = config;
