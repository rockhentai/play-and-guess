var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var uglify = require('gulp-uglify');
var browserify = require('gulp-browserify');
var sass = require('gulp-sass');
var reload = browserSync.reload;

var config = {
  baseDir:'app',
  watchFiles:['app/*.html','app/css/*.css','app/js/*.js']
}

gulp.task('server',function() {
  browserSync.init({
    files:config.watchFiles,
    server:{
      baseDir:config.baseDir
    }
  });
  gulp.watch('app/scss/*.scss',['sass']);
  gulp.watch('app/*.html').on('change',reload);
});

//scss文件编译成css
gulp.task('sass',function() {
  return gulp.src('app/scss/*.scss')
              .pipe(sass())
              .pipe(gulp.dest('app/css'))
              .pipe(reload({stream:true}));
});

//js压缩
gulp.task('js',function() {
  return gulp.src('app/js/*.js')
              .pipe(browserify())
              .pipe(uglify())
              .pipe(gulp.dest('dist/js'));
});

//创建一个任务确保‘js’在刷新浏览器钱完成
//gulp.task('js-watch',['js'],reload)

gulp.task('default',['server']);
