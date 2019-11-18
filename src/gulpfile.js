var gulp = require('gulp');
var babel = require('gulp-babel');//把es6语法解析成es5
var concat = require('gulp-concat');//合并
var uglify = require('gulp-uglify');//压缩
var rev = require('gulp-rev');//对文件名加MD5后缀
var revCollector = require('gulp-rev-collector');//替换路径
var htmlmin = require('gulp-htmlmin'); //压缩html里面的js，css，去除空格
var del = require('del');//删除文件
//js压缩  {base:'.'}匹配目录复制
gulp.task('js',function(){
    return gulp.src('./js/*.js',{base:'.'})
    .pipe(babel())
    .pipe(uglify())
    .pipe(rev())
    .pipe(gulp.dest('./build'))//移动到build
    .pipe(rev.manifest('rev-js-manifest.json'))//生成文件映射
    .pipe(gulp.dest('./build'));//将"映射文件!!!!"导出到build/src
});
//css压缩
// var autoprefix = require('gulp-autoprefixer');//兼容处理
var minifyCss = require('gulp-minify-css');//压缩
gulp.task('style',function(){
    return gulp.src('./css/*.css',{base:'.'})
        // .pipe(autoprefix({
        //         browsers: ['last 2 versions'],
        //         cascade: false
        //     }))
        .pipe(minifyCss())
        .pipe(rev())
        .pipe(gulp.dest('./build'))
        .pipe(rev.manifest('rev-css-manifest.json'))
        .pipe(gulp.dest('./build'));
});
//img
gulp.task('images', function (){
    return gulp.src('./images/*.jpg',{base:'.'})  
        .pipe(rev())//文件名加MD5后缀
        .pipe(gulp.dest('./build')) 
        .pipe(rev.manifest('rev-images-manifest.json'))//生成一个rev-manifest.json路径与css中保持一致
        .pipe(gulp.dest('./build'));//将 rev-manifest.json 保存到 build 目录内
});
//html压缩
gulp.task('revHtml',function(){
    var options = {
        removeComments: true,//清除HTML注释
        collapseWhitespace: true,//压缩HTML
        collapseBooleanAttributes: true,//省略布尔属性的值 <input checked="true"/> ==> <input />
        removeEmptyAttributes: true,//删除所有空格作属性值 <input id="" /> ==> <input />
        removeScriptTypeAttributes: true,//删除<script>的type="text/javascript"
        removeStyleLinkTypeAttributes: true,//删除<style>和<link>的type="text/css"
        minifyJS: true,//压缩页面JS
        babel:true,
        minifyCSS: true//压缩页面CSS
    };
    return gulp.src('./html/*.html',{base:'.'})
        .pipe(htmlmin(options))
        .pipe(gulp.dest('./build'))
});
//使用rev替换成md5文件名，这里包括html和css的资源文件也一起
gulp.task('rev', function() {
    //html，针对js,css,img
    return gulp.src(['./build/**/*.json', './build/**/*.html'])
        .pipe(revCollector({
           
            replaceReved:true
        }))
        .pipe(gulp.dest('./build'));
});
gulp.task('revimg', function() {
    //css，主要是针对img路径替换
    return gulp.src(['./build/**/rev-images-manifest.json', './build/**/*.css'])
        .pipe(revCollector({
            replaceReved:true
        }))
        .pipe(gulp.dest('./build'));
});
gulp.task('revjs', function() {
    //js，主要是针对img路径替换
    return gulp.src(['./build/**/rev-images-manifest.json', './build/**/*.js'])
        .pipe(revCollector({
            replaceReved:true
         }))
        .pipe(gulp.dest('./build'));
});
//每次打包之前删除build文件 clean:build 中build与'./build'保持一致
gulp.task('clean:build', function () {
   return del([
        './build',
    ]);
});


//执行多个任务gulp4的用法 gulp.series()串行，gulp.parallel()并行
gulp.task('default', gulp.series('clean:build', gulp.parallel('js','images','style','revHtml'),'rev','revimg','revjs',function(done){
    done()
}))