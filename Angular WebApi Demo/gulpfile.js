'use strict';

var gulp = require("gulp"),
    config = require('./gulp/config'),
    plugins = {
        gutil: require('gulp-util')
    };

// default task 
gulp.task("default", function (done) {
    plugins.gutil.log("Hello " + config.projectName);
    done();
});

//linting
//Ensures scripts (.js files in app directory) follow the style standards set in the .eslintrc file
var lint = require('./gulp/lint');
gulp.task("lint", lint.lint);

//bump
//update version number in package.json and assemblyInfo.cs files 
var bump = require('./gulp/bump');
gulp.task('bump:major', bump.bumpMajor);
gulp.task('bump:minor', bump.bumpMinor);
gulp.task('bump:patch', bump.bumpPatch);

//compile
var compile = require('./gulp/compile');
gulp.task('compile:solution', compile.buildSolution);

//release
gulp.task('compile:release', compile.packageRelease)

//inject
var inject = require('./gulp/inject');
gulp.task('inject', inject.inject);

// compile sass
var sass = require('./gulp/styles');
gulp.task('compile:sass', sass.compileSass);

//watch files and reload browser sync
var watch = require('./gulp/watch');
gulp.task('browsersync', watch.browsersync);