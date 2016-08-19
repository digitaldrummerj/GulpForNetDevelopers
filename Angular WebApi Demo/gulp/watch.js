'use strict';

var gulp = require('gulp'),
	inject = require('./inject'),
	config = require('./config'),
    styles = require('./styles'),
	plugins = {
	    // gulp.watch doesn't watch for additions or deletion of new files- so I'm using gulp-watch plugins.
	    watch: require('gulp-watch'),
	    browsersync: require('browser-sync'),
	    del: require('del'),
	    globby: require('globby'),
	    gutil: require('gulp-util'),
	},
	paths = config.paths,
	files = config.files,
	fileCollections = config.fileCollections,
    watchOptions = {
        ignorePermissionErrors: true
    };

function browsersync(done) {
    if (plugins.browsersync.active) {
        console.log('browser')
        done();
        return;
    }

    var options = {
        proxy: 'localhost:' + config.iisPort,
        port: config.iisPort,
        ghostMode: {
            clicks: true,
            forms: true,
            scrolling: true
        },
        injectChanges: true,
        logFileChanges: true,
        logConnections: true,
        logPrefix: 'browser-sync',
        logLevel: 'debug',
        notify: true,
        reloadDelay: 100
    };

    plugins.browsersync(options);
    done();

}


function watchStyles(done) {
    const name = "styleWatcher";
    // Add in mainScss file into collection of styles to monitor
    // Not added in by default to avoid infinite loop for inject.
    //.slice(0) makes a copy of the fileCollections.styles
    var styles = fileCollections.styles.slice(0);
    styles.push(files.mainScss);
    var styleWatcher = gulp.watch(styles, watchOptions);

    //has to be defined this way.  If gulp.series added to on it won't fire since gulp.series returns a function.
    const scriptWatcherTasks = gulp.series
        (
            inject.injectCss,
            plugins.browsersync.reload
        );

    // monitor all change events.
    styleWatcher
        .on('add', function (file) {
            plugins.gutil.log(name + ' Add ' + file + ', running tasks...');
            scriptWatcherTasks();
        })
        .on('change', function (file) {
            plugins.gutil.log(name + ' Change ' + file + ', running tasks...');
            scriptWatcherTasks();
        })
        .on('unlink', function (file) {
            plugins.gutil.log(name + ' Delete ' + file + ', running tasks...');
            scriptWatcherTasks();
        })
     .on('error', function (error) { plugins.gutil.log(name + ' ' + error); });

    done();
}

function watchScripts(done) {
    const name = "scriptsWatcher";
    var scriptsWatcher = gulp.watch(fileCollections.scripts, watchOptions);
    const scriptWatchTasks = gulp.series(
        inject.injectJavaScript,
        plugins.browsersync.reload
    );

    scriptsWatcher
        .on('add', function (file) {
            plugins.gutil.log(name + ' Add ' + file + ', running tasks...');
            scriptWatchTasks();
        })
        .on('change', function (file) {
            plugins.gutil.log(name + ' Change ' + file + ', running tasks...');
            scriptWatchTasks();
        })
        .on('unlink', function (file) {
            plugins.gutil.log(name + ' Delete ' + file + ', running tasks...');
            scriptWatchTasks();
        })
     .on('error', function (error) { plugins.gutil.log(name + ' ' + error); });

    done();
}

function watchHtml(done) {
    var htmlWatcher = gulp.watch(fileCollections.html, watchOptions);
    const name = "htmlWatcher";
    htmlWatcher
        .on('add', function (file) {
            plugins.gutil.log(name + ' Add ' + file + ', running tasks...');
            plugins.browsersync.reload();
        })
        .on('change', function (file) {
            plugins.gutil.log(name + ' Change ' + file + ', running tasks...');
            plugins.browsersync.reload();
        })
        .on('unlink', function (file) {
            plugins.gutil.log(name + ' Delete ' + file + ', running tasks...');
            plugins.browsersync.reload();
        })
     .on('error', function (error) { plugins.gutil.log(name + ' ' + error); });

    done();
}

function watchBowerComponents(done) {
    const name = "bowerComponentWatcher";
    var bowerComponentWatcher = gulp.watch(files.bowerComponents, watchOptions);
    const bowerComponentWatcherTasks = gulp.series
        (
            inject.inject,
            plugins.browsersync.reload
        );

    bowerComponentWatcher
        .on('add', function (file) {
            plugins.gutil.log(name + ' Add ' + file + ', running tasks...');
            bowerComponentWatcherTasks();
        })
        .on('change', function (file) {
            plugins.gutil.log(name + ' Change ' + file + ', running tasks...');
            bowerComponentWatcherTasks();
        })
        .on('unlink', function (file) {
            plugins.gutil.log(name + ' Delete' + file + ', running tasks...');
            bowerComponentWatcherTasks();
        })
     .on('error', function (error) { plugins.gutil.log(name + '  ' + error); });

    done();
}

var sync = gulp.series(
    browsersync,
    gulp.parallel(
        watchBowerComponents,
        watchHtml,
        watchScripts,
        watchStyles
    )
);

module.exports = {
    browsersync: sync
};
