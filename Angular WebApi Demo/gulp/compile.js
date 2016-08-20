'use strict';

var gulp = require('gulp'),
	config = require('./config'),
	bump = require('./bump'),
	lint = require('./lint'),
    inject = require('./inject'),
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
    buildBaseDir = config.paths.buildsBaseDir,
    tmpBuildDir = config.paths.tmpBuildDir,
    buildVersion = '0.0.0',
	buildDir = buildBaseDir + '/' + buildVersion,
	isDryRun = false;

function buildSolution() {
	return gulp.src(config.files.solutionFiles)
		.pipe(plugins.msbuild({
		    properties: { OutputPath: tmpBuildDir },
		    stdout: true,
		    logCommand: true,
		    errorOnFail: true,
		    toolsVersion: 14.0,
		    verbosity: "minimal"
		}));
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

function commitVersionFiles(done) {
	if (isDryRun) { done(); return; }
	return gulp.src([config.files.bowerJson, config.files.packageJson, config.files.assemblyInfoFiles])
    .pipe(plugins.git.add())
        .pipe(plugins.git.commit('gulp build for v' + buildVersion, { emitData: true }))
        .on('end', function () {
        	plugins.git.push('origin', 'master', done);
        });
}

function deleteBuildDir() {
	return plugins.del([buildDir], { force: true });
}

function getGhPages(done) {
	if (isDryRun) { done(); return; }
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
	if (isDryRun) { done(); return; }
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

function moveAndFlattenFonts() {
	return gulp.src(config.files.bowerComponents + '.{eot,svg,ttf,woff,woff2}', { base: config.files.bowerComponents })
	    .pipe(plugins.flatten())
	    .pipe(gulp.dest(config.paths.distFonts));
}

function moveBowerComponentImagesToDist() {
	return gulp.src(config.files.bowerComponents + '.{png,jpg,jpeg}', { base: config.paths.app })
	    .pipe(gulp.dest(config.paths.distImages))
}

function moveScriptsToDist() {
	return plugins.domSrc({
		file: config.files.indexHtml,
		selector: 'script',
		attribute: 'src'
	})
	    .pipe(plugins.ngAnnotate())
	    .pipe(plugins.uglify()) //takes a long time
	    .pipe(plugins.concat('app.js'))
	    .pipe(plugins.rev())
	    .pipe(gulp.dest(config.paths.distScripts))
}

function moveCssToDist() {
	plugins.gutil.log("paths.distStyles: " + config.paths.distStyles);
	return plugins.domSrc({
		file: config.files.indexHtml,
		selector: 'link',
		attribute: 'href'
	})
	    .pipe(plugins.rev())
	    .pipe(gulp.dest(config.paths.distStyles))
}

function copyToBuildDir() {
    plugins.gutil.log('projectTmpBuildOutput: ' + config.paths.projectTmpBuildOutput);
    plugins.gutil.log('buildDir: ' + buildDir);
    return gulp.src([config.files.projectTmpBuildOutput, '!' + config.projectTmpBuildOutput + '.gitignore'])
        .pipe(gulp.dest(buildDir));
}

function copyToFileShare(done) {
    return gulp.src(buildDir + '/**/*')
		.pipe(gulp.dest(config.paths.deployFileShare + '/' + buildVersion + '/'));
}

function addCommitPushGhPages(done) {
	if (isDryRun) { done(); return; }
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

var compile = gulp.series(lint.lint, inject.inject, updateBuildDir, deleteBuildDir, buildSolution, copyToBuildDir);

var packageRelease = gulp.series(
        lint.lint,
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

function setDryRun(done) {
	isDryRun = true;
	done();
}

function removeDryRun(done) {
	isDryRun = false;
	done();
}

var packageDryRun = gulp.series(setDryRun, packageRelease, removeDryRun);

module.exports = {
	packageRelease: packageRelease,
    buildSolution: compile,
    packageReleaseDryRun: packageDryRun
};