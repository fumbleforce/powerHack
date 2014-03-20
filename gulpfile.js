var gulp = require('gulp');
var gutil = require('gulp-util');
var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');
var minifyHTML = require('gulp-minify-html');
var minifyCSS = require('gulp-minify-css');
var browserify = require('gulp-browserify');
var concat = require('gulp-concat');
var clean = require('gulp-clean');

gulp.task('lint', function() {
  gulp.src('./public/src/js/app.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('clean', function() {
    gulp.src('./public/dist/js/*.js', {read: false})
        .pipe(clean());
});


gulp.task('browserify', function() {
    gulp.src(['./public/src/js/*.js'])
        .pipe(concat('bundle.js'))
        .pipe(gulp.dest('./public/dist/js/'));
});

gulp.task('consolidate', function() {
    gulp.src(['./public/src/js/*.js',
      './bower_components/angular/angular.js',
      './bower_components/angular-route/angular-route.js'])
        .pipe(gulp.dest('./public/dist/js/'));
});

gulp.task('fix', function() {
    gulp.src([ './public/dist/js/unfixed_bundle.js', './public/src/js/*.js',])
        .pipe(concat('bundle.js'))
        .pipe(gulp.dest('./public/dist/js/'));
});

gulp.task('minify-html', function() {
  gulp.src('./public/src/templates/*.html')
    .pipe(minifyHTML(opts))
    .pipe(gulp.dest('./public/dist/templates/'));
});

gulp.task('minify-html-index', function() {
  gulp.src('./public/*.html')
    .pipe(minifyHTML(opts))
    .pipe(gulp.dest('./public/dist/'));
});

gulp.task('default', function(){
  gulp.run('clean', 'consolidate', 'minify-html', 'minify-html-index', 'lint');
});