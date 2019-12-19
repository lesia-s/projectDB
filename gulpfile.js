/* eslint-disable node/no-unpublished-require */
const gulp = require('gulp')
const sass = require('gulp-sass')
const autoprefixer = require('gulp-autoprefixer')
const cssnano = require('gulp-cssnano')
const del = require('del')
const plumber = require('gulp-plumber')
const nodemon = require('gulp-nodemon')
const concat = require('gulp-concat')
//const uglify = require('gulp-uglifyjs')
/* eslint-enable node/no-unpublished-require */

gulp.task('nodeMon', function(done) {
  nodemon({
    script: 'app.js',
    done: done
  })
})

gulp.task('clean', function() {
  return del(['public/stylesheets','public/javascripts'])
})

gulp.task('scss', function() {
  return gulp
    .src('dev/scss/**/*.scss')
    .pipe(plumber())
    .pipe(sass())
    .pipe(
      autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], {
        cascade: true
      })
    )
    .pipe(cssnano())
    .pipe(gulp.dest('public/stylesheets'))
})

gulp.task('scripts', function() {
  return gulp
    .src([
      'node_modules/medium-editor/dist/js/medium-editor.min.js',
      'dev/js/auth.js',
      'dev/js/post.js'
    ])
    .pipe(plumber())
    .pipe(concat('scripts.js'))
    // .pipe(uglify())
    .pipe(gulp.dest('public/javascripts'))
})

gulp.task('watch', function() {
  gulp.watch('dev/scss/**/*.scss', gulp.series('scss'));
  gulp.watch('dev/js/**/*.js', gulp.series('scripts'));
})

gulp.task('build', gulp.series('clean', gulp.parallel('scss', 'scripts')))

gulp.task('default', gulp.parallel('build', 'nodeMon', 'watch'))