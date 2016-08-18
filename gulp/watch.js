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
	fileCollections = config.fileCollections;

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
function watch(done) {

    var styles = fileCollections.styles.slice(0);
    styles.push(files.mainScss);

    plugins.watch(
		plugins.globby.sync(styles),
		{
		    events: ['change', 'add']
		},
		gulp.series(
                inject.injectCss,
                plugins.browsersync.reload            
        )
	);

    plugins.watch(
		plugins.globby.sync(fileCollections.scripts),
		{
		    events: ['change', 'add', 'addDir', 'unlink', 'unlinkDir']
		},
		gulp.series(
                inject.injectJavaScript,
                plugins.browsersync.reload
        )		
	);

    plugins.watch(
		plugins.globby.sync(fileCollections.html),
		{
		    events: ['add', 'addDir', 'unlink', 'unlinkDir', 'change']
		},
		gulp.series(function (done) {
		    plugins.gutil.log('browsersync html');
		    plugins.browsersync.reload();
		    done();
		})
	);

    plugins.watch(
        plugins.globby.sync(files.bowerComponents),
		{
		    events: ['change', 'add', 'addDir', 'unlink', 'unlinkDir']
		},
		gulp.series(
                inject.inject,
                plugins.browsersync.reload
        )
	);

    done();
}

var sync = gulp.series(browsersync, watch);
module.exports = {
    watch: watch,
    browsersync: sync
};
