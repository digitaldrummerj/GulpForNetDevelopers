'use strict';

var gulp = require('gulp'),
    config = require('./config'),
    styles = require('./styles'),
    plugins = {
        autoprefixer: require('gulp-autoprefixer'),
        flatten: require('gulp-flatten'),
        inject: require('gulp-inject'),
        mainBowerFiles: require('main-bower-files'),
        sass: require('gulp-sass'),
        sourcemaps: require('gulp-sourcemaps')
    };

function compileSass() {
    return gulp.src(config.files.mainScss)
		    .pipe(plugins.inject(
			    gulp.src(config.fileCollections.styles),
			    {
			        relative: true,
			        starttag: '/*** scss-inject ***/',
			        endtag: '/*** end scss-inject ***/',
			        transform: function (filepath) {
			            return '@import "' + filepath + '";';
			        }
			    }
		))
		.pipe(plugins.sourcemaps.init())
		.pipe(plugins.sass({
		    includePaths: [config.paths.bowerComponents],
		    outputStyle: 'compressed'
		}))
		.pipe(plugins.autoprefixer())
		.pipe(plugins.sourcemaps.write())
		.pipe(gulp.dest(config.paths.tmp));
};

//Bower components that have CSS dependencies
function moveVendorCssFiles(cb) {
    var bowerCss = plugins.mainBowerFiles({ filter: '**/*.css' });
    // the below if statement is a temporary workaround for gulp 4.0; implemented Sep 29 2015
    // gulp 4.0 (still alpha) cannot handle empty arrays in a `gulp.src` until this is fixed (again). See the following discussions:
    // https://github.com/gulpjs/vinyl-fs/issues/40#issuecomment-144231884
    // https://github.com/jonschlinkert/is-valid-glob/issues/3
    // We can remove it once the issues are resolved and vinyl-fs is using the fixed version of is-valid-glob
    if (bowerCss.length === 0) {
        cb();
        return;
    }
    return gulp.src(bowerCss, { base: config.paths.bowerComponents })
		.pipe(plugins.flatten())
		.pipe(gulp.dest(config.paths.tmp));
}
module.exports = {
    compileSass: compileSass,
    moveVendorCssFiles: moveVendorCssFiles
}
