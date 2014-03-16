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
  gulp.src('./app/src/js/app.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('clean', function() {
    gulp.src('./app/dist/js/*.js', {read: false})
        .pipe(clean());
});


gulp.task('browserify', function() {
    gulp.src(['./app/src/js/*.js'])
        .pipe(concat('bundle.js'))
        .pipe(gulp.dest('./app/dist/js/'));
});

gulp.task('consolidate', function() {
    gulp.src(['./app/src/js/*.js',
      './bower_components/angular/angular.js',
      './bower_components/angular-route/angular-route.js'])
        .pipe(gulp.dest('./app/dist/js/'));
});

gulp.task('fix', function() {
    gulp.src([ './app/dist/js/unfixed_bundle.js', './app/src/js/*.js',])
        .pipe(concat('bundle.js'))
        .pipe(gulp.dest('./app/dist/js/'));
});

gulp.task('minify-html', function() {
  gulp.src('./app/src/templates/*.html')
    .pipe(minifyHTML(opts))
    .pipe(gulp.dest('./app/dist/templates/'));
});

gulp.task('default', function(){
  gulp.run('clean', 'consolidate', 'minify-html', 'lint');
});