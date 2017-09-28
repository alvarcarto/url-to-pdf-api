const createApp = require('./app');
const enableDestroy = require('server-destroy');
const BPromise = require('bluebird');
const logger = require('./util/logger')(__filename);
const config = require('./config');

BPromise.config({
  warnings: config.NODE_ENV !== 'production',
  longStackTraces: true,
});

const app = createApp();
const server = app.listen(config.PORT, () => {
  logger.info(
    'Express server listening on http://localhost:%d/ in %s mode',
    config.PORT,
    app.get('env')
  );
});
enableDestroy(server);

function closeServer(signal) {
  logger.info(`${signal} received`);
  logger.info('Closing http.Server ..');
  server.destroy();
}

// Handle signals gracefully. Heroku will send SIGTERM before idle.
process.on('SIGTERM', closeServer.bind(this, 'SIGTERM'));
process.on('SIGINT', closeServer.bind(this, 'SIGINT(Ctrl-C)'));

server.on('close', () => {
  logger.info('Server closed');
  process.emit('cleanup');

  logger.info('Giving 100ms time to cleanup..');
  // Give a small time frame to clean up
  setTimeout(process.exit, 100);
});
