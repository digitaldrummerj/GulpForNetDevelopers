'use strict';

var gulp = require('gulp'),
    plugins = {
        msbuild: require("gulp-msbuild"),
        gutil: require('gulp-util'),
        data: require('gulp-data'),
        del: require('del'),
        git: require('gulp-git')
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

function copyToFileShare() {
    return gulp.src(buildDir + '/**/*')
		.pipe(gulp.dest(fileShare + '/' + buildVersion + '/'));
}

function getGhPages() {
    return git.clone(config.paths.gitUrl, { args: buildDir }, function (err) {
        // handle err 
        console.log('getGhPages Clone Error', err);
    })
    .pipe(
        git.checkout('gh-pages', { args: '-b' }, function (err) {
            //if (err) throw err;
            console.log('getGhPages get gh-pages', err);
        })
    );
}

function deleteExistingFiles() {
    return plugins.del(buildDir + '/**/*', { force: true });
}

function addCommitPushGhPages() {
    return gulp.src(buildDir)
        .pipe(git.add())
        .pipe(git.commit('gulp build for v' + buildVersion))
        .pipe(git.push('origin', 'gh-pages', function (err) {
            if (err) throw err;
        }));
}

function commitVersionFiles() {
    return gulp.src(config.paths.appRoot)
        .pipe(add())
        .pipe(git.commit('gulp build for v' + buildVersion))
        .pipe(gt.push('origin', 'master', function (err) {
            if (err) throw err;
        }));
}

var compile = gulp.series(updateBuildDir, deleteBuildDir, buildSolution, copyToBuildDir);

var packageRelease = gulp.series(
        bump.bumpPatch,
        updateBuildDir,
        deleteBuildDir,
        gulp.parallel(
            buildSolution,
            getGHPages
        ),
        deleteExistingFiles,
        copyToBuildDir,
        gulp.parallel(
            addCommitPushGhPages,
            copyToFileShare
        ),
        commitVersionFiles
    );

module.exports = {
    packageRelease: packageRelease,
    buildSolution: compile
};