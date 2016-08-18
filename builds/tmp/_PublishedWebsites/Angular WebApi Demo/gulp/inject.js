'use strict';

var gulp = require('gulp'),
    config = require('./config'),
    styles = require('./styles'),
    plugins = {
        angularFilesort: require('gulp-angular-filesort'),
        inject: require('gulp-inject'),
        naturalSort: require('gulp-natural-sort'),
        mainBowerFiles: require('main-bower-files')
    },
    injectIgnore = [

    ];

function mainBowerFilesFilter(filePath) {
    if (injectIgnore.length === 0) {
        return true;
    }

    for (var i = 0; i < injectIgnore.length; i++) {
        if (filePath.indexOf(injectIgnore[i]) !== -1) {
            return false;
        }
    }

    return true;
}

function injectJavaScript() {
    return gulp.src(config.files.indexHtml)
		.pipe(plugins.inject(gulp.src(plugins.mainBowerFiles({ filter: mainBowerFilesFilter }), {
		    base: config.paths.app,
		    read: false
		}), {
		    relative: true,
		    name: 'bower'
		}))
		.pipe(plugins.inject(gulp.src(config.fileCollections.scripts)
				.pipe(plugins.naturalSort())
				.pipe(plugins.angularFilesort()),
			{ relative: true }))
		.pipe(gulp.dest(config.paths.appRoot));
}

var injectCss = gulp.series(
    gulp.parallel(
       styles.compileSass,
        styles.moveVendorCssFiles
    ),
    function () {
        return gulp.src(config.files.indexHtml)
            .pipe(plugins.inject(gulp.src(config.files.tmpCss),
                {
                    relative: true
                }))
            .pipe(gulp.dest(config.paths.appRoot));
    }
);

var inject = gulp.series(injectJavaScript, injectCss);

module.exports = {
    inject: inject,
};