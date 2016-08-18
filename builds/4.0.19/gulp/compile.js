'use strict';

var gulp = require('gulp'),
    plugins = {
        msbuild: require("gulp-msbuild"),
        gutil: require('gulp-util'),
        data: require('gulp-data'),
        del: require('del')
    },
    config = require('./config'),
    bump = require('./bump'),
    files = config.files,
    paths = config.paths,
    solutionFiles = config.files.solutionFiles,
    fileShare = config.paths.deployFileShare,
    
    buildBaseDir = config.paths.buildsBaseDir,
    tmpBuildDir = config.paths.tmpBuildDir,
    buildVersion = '0.0.0';

var buildDir = buildBaseDir + '/' + buildVersion;

//bump
//get version
//update build dir with version
//build solution

// default configuration is release
// default target is Rebuild
function buildSolution() {
    return gulp.src(solutionFiles)
		.pipe(plugins.msbuild({
		    properties: { OutputPath: tmpBuildDir },
		    stdout: true,
		    logCommand: true,
		    errorOnFail: true,
		    toolsVersion: 14.0,
		    verbosity: "minimal"

		}));
}

function copyToBuildDir() {
    plugins.gutil.log('projectTmpBuildOutput: ' + paths.projectTmpBuildOutput);
    plugins.gutil.log('buildDir: ' + buildDir);
        return gulp.src([paths.projectTmpBuildOutput])
            .pipe(gulp.dest(buildDir));
}

function updateBuildDir() {
    return gulp.src(config.files.packageJson)
		.pipe(plugins.data(function (file) {
		    var config = JSON.parse(file.contents);
		    buildVersion = config.version;
		    buildDir = buildBaseDir + '/' + buildVersion;
		    plugins.gutil.log('Build Version: ' + buildVersion);
		    plugins.gutil.log('Build Dir: ' + buildDir);

		    return config;
		}));
}

function deleteBuildDir() {
    return plugins.del([buildDir], { force: true });
}



var compile = gulp.series(updateBuildDir, deleteBuildDir, buildSolution, copyToBuildDir);

var packageRelease = gulp.series(
        bump.bumpPatch,
        updateBuildDir,
        deleteBuildDir,
        buildSolution,
        copyToBuildDir
    );
module.exports = {
    packageRelease: packageRelease,
    buildSolution: compile
};