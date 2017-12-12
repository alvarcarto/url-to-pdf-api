const gulp = require('gulp');
const gls = require('gulp-live-server');

const server = gls.new('src/index.js');

gulp.task('serve', () => {
  server.start();
});

gulp.task('serve:dev', () => {
  server.start();
  gulp.watch([
    'src/**/*.js',
  ], ['serve']);
});
