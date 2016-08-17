'use strict';

var gulp = require('gulp'),
plugins = {
    eslint: require('gulp-eslint')
},
config = require("./config");

function lint() {
    // Note: To have the process exit with an error code (1) on lint error, return the stream and pipe to failOnError last.
    return gulp.src(config.fileCollections.scripts)
		.pipe(plugins.eslint())
		.pipe(plugins.eslint.format())
		.pipe(plugins.eslint.failAfterError());
}

module.exports = {
    lint: lint
};
