'use strict';

var gulp = require('gulp'),
    plugins = {
        concat: require('gulp-concat'),
        data: require('gulp-data'),
        del: require('del'),
        domSrc: require('gulp-dom-src'),
        flatten: require('gulp-flatten'),
        git: require('gulp-git'),
        gutil: require('gulp-util'),
        msbuild: require("gulp-msbuild"),
        ngAnnotate: require('gulp-ng-annotate'),
        rev: require('gulp-rev'),
        revReplace: require('gulp-rev-replace'),
        uglify: require('gulp-uglify')
    },
    config = require('./config'),
    bump = require('./bump'),
    files = config.files,
    paths = config.paths,
    fileCollections = config.fileCollections,
    solutionFiles = config.files.solutionFiles,
    fileShare = config.paths.deployFileShare,

    buildBaseDir = config.paths.buildsBaseDir,
    tmpBuildDir = config.paths.tmpBuildDir,
    buildVersion = '0.0.0',
    lint = require('./lint').lint,
    inject = require('./inject');


var buildDir = buildBaseDir + '/' + buildVersion;

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
    return gulp.src([files.projectTmpBuildOutput, '!' + files.projectTmpBuildOutput + '.gitignore'])
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

function copyToFileShare(done) {
    return gulp.src(buildDir + '/**/*')
		.pipe(gulp.dest(fileShare + '/' + buildVersion + '/'));
}

function getGhPages(done) {
    plugins.git.clone(config.paths.gitUrl, { args: buildDir }, function (err) {
        // handle err 
        if (err) {
            console.log('getGhPages Clone Error', err);
            throw err;
        }
        done();
    });
}

function checkoutGhPages(done) {
    plugins.git.checkout('gh-pages', { cwd: buildDir }, function (err) {
        if (err) {
            console.log('checkoutGhPages error', err);
            throw err;
        }
        done();
    });
}

function deleteExistingFiles(done) {
    return plugins.del([buildDir + '/**/*', '!' + buildDir + '/.git/*'], { force: true });
}

function addCommitPushGhPages(done) {
    return gulp.src(buildDir + '/**/*')
        .pipe(plugins.git.add({ args: '--all', cwd: buildDir }))
        .pipe(plugins.git.commit('gulp build for v' + buildVersion, {emitData:true, cwd: buildDir }))
        //.on('data',function(data) {
        //    console.log(data);
        //})
        .on('end', function() {
            plugins.git.push('origin', 'gh-pages', { cwd: buildDir }, function (err) {
                if (err) throw err;
                done();
            });
        });
}

function commitVersionFiles(done) {
    return gulp.src([files.bowerJson, files.packageJson, files.assemblyInfoFiles])
    .pipe(plugins.git.add())
        .pipe(plugins.git.commit('gulp build for v' + buildVersion, { emitData: true}))
        .on('end', function() {
            plugins.git.push('origin', 'master', done);
        });
}

function moveAndFlattenFonts() {
    return gulp.src(files.bowerComponents + '.{eot,svg,ttf,woff,woff2}', { base: files.bowerComponents })
	    .pipe(plugins.flatten())
	    .pipe(gulp.dest(paths.distFonts));
}

function moveBowerComponentImagesToDist() {
    return gulp.src(files.bowerComponents + '.{png,jpg,jpeg}', { base: paths.app })
	    .pipe(gulp.dest(paths.distImages))
}

function moveScriptsToDist() {
    return plugins.domSrc({
        file: files.indexHtml,
        selector: 'script',
        attribute: 'src'
    })
	    .pipe(plugins.ngAnnotate())
	    .pipe(plugins.uglify()) //takes a long time
	    .pipe(plugins.concat('app.js'))
	    .pipe(plugins.rev())
	    .pipe(gulp.dest(paths.distScripts))
}

function moveCssToDist() {
    plugins.gutil.log("paths.distStyles: " + paths.distStyles);
    return plugins.domSrc({
        file: files.indexHtml,
        selector: 'link',
        attribute: 'href'
    })
	    .pipe(plugins.rev())
	    .pipe(gulp.dest(paths.distStyles))
}

var compile = gulp.series(updateBuildDir, deleteBuildDir, buildSolution, copyToBuildDir);

var packageRelease = gulp.series(
        lint,
        inject.inject,
        bump.bumpPatch,
        updateBuildDir,
        commitVersionFiles,
        deleteBuildDir,
        gulp.parallel(
            buildSolution,
            getGhPages
        ),
        checkoutGhPages,
        deleteExistingFiles,
        moveAndFlattenFonts,
        moveScriptsToDist,
		moveCssToDist,
        inject.injectRelease,
        copyToBuildDir,
        addCommitPushGhPages
    );

module.exports = {
    packageRelease: packageRelease,
    buildSolution: compile
};