'use strict';

const gulp = require('gulp');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const sass = require('gulp-sass')(require('node-sass'));

gulp.task('sass', function() {
    return gulp.src('./sass/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('./public/css'));
});

gulp.task('sass:watch', () => {
    gulp.watch('./sass/**/*.scss', gulp.series('sass'));
});

gulp.task('js', function() {
    return gulp.src(['./node_modules/jquery/dist/jquery.js', './node_modules/foundation-sites/dist/js/foundation.js', './js/*.js'])
        .pipe(concat('main.js'))
        .pipe(uglify())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('./public/js'));
});

gulp.task('js:watch', () => {
    gulp.watch('./js/*.js', gulp.series('js'));
});

gulp.task('build', gulp.series('sass', 'js'));