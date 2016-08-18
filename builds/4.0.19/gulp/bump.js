'use strict';

var gulp = require('gulp'),
    plugins = {
        bump: require('gulp-bump'),
        semver: require('semver'),
        fs: require('fs'),
        assemblyInfo: require('gulp-dotnet-assembly-info'),
    },
    config = require('./config'),
    files = [config.files.packageJson, config.files.bowerJson],
    assemblyInfoFiles = config.files.assemblyInfoFiles,
    newVer = "0.0.0";

var getPackageJson = function () {
    return JSON.parse(plugins.fs.readFileSync(config.files.packageJson, 'utf8'));
};

function updateMajor(done) {
    var pkg = getPackageJson();
    newVer = plugins.semver.inc(pkg.version, 'major');
    return done();
}

function updateMinor(done) {
    var pkg = getPackageJson();
    newVer = plugins.semver.inc(pkg.version, 'minor');
    return done();
}

function updatePatch(done) {
    var pkg = getPackageJson();
    newVer = plugins.semver.inc(pkg.version, 'patch');
    return done();
}

function updateVersion() {
    return gulp.src(files)
      .pipe(plugins.bump({ version: newVer }))
      .pipe(gulp.dest('./'));
}

function updateAssemblyInfoFiles(done) {
    console.log(newVer);
    console.log(assemblyInfoFiles);
    return gulp.src(assemblyInfoFiles)
		.pipe(plugins.assemblyInfo({
		    version: newVer,
		    fileVersion: newVer
		}))
		.pipe(gulp.dest('../'));

}

var bumpMajor = gulp.series(updateMajor, gulp.parallel(updateAssemblyInfoFiles, updateVersion));

var bumpMinor = gulp.series(updateMinor, gulp.parallel(updateAssemblyInfoFiles, updateVersion));

var bumpPatch = gulp.series(updatePatch, gulp.parallel(updateAssemblyInfoFiles, updateVersion));

module.exports = {
    bumpMajor: bumpMajor,
    bumpMinor: bumpMinor,
    bumpPatch: bumpPatch,
    newVersion: newVer
};
