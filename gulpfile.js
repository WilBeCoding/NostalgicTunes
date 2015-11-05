var gulp = require('gulp');
var sass = require('gulp-ruby-sass');
var sourcemaps = require('gulp-sourcemaps');
var autoprefixer = require('gulp-autoprefixer');
var minifycss = require('gulp-minify-css');
var rename = require('gulp-rename');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify')

gulp.task('process-scripts', function() {
  return sass('./public/javascripts/*.js')
    .on('error', sass.logError)
    .pipe(concat('main.js'))
    .pipe(gulp.desk('./public/javascripts'))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(gulp.dest('/public/javascripts/'))
});

gulp.task('sass', function() {
  return sass('./public/stylesheets/style.scss', {sourcemap: true, style: 'nested'})
    .on('error', sass.logError)
    .pipe(autoprefixer('last 2 version'))
    .pipe(gulp.dest('./public/stylesheets/'))
    .pipe(rename({suffix: '.min'}))
    .pipe(minifycss())
    .pipe(sourcemaps.write('maps'))
    .pipe(gulp.dest('./public/stylesheets/'))
});

gulp.task('watch', function() {
  gulp.watch('./public/stylesheets/*.scss', ['sass'])
});

gulp.task('watch1', function() {
  gulp.watch('./public/javascripts/*.js', ['process-scripts'])
});
