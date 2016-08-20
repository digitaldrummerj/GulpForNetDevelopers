'use strict';

var gulpUtil = require('gulp-util');

var projectName = 'MusicCityCode', // must be kebab-case
    moduleName = 'musicCityCode', // must be camelCase
    dotNetProjectName = 'Angular WebApi Demo',
    appRoot = './',
    app = appRoot + 'App',
    
    buildsBaseDir = '../../builds',
    distRoot = buildsBaseDir,
    tmpBuildDir = buildsBaseDir + '/tmp',
    projectTmpBuildOutput = tmpBuildDir + '/' + '_PublishedWebsites/' + dotNetProjectName,
    iisPort = 56712;

var paths = {
    app: app,
    appRoot: appRoot,
    bowerComponents: app + '/bower_components',
    buildsBaseDir: buildsBaseDir,
    deployFileShare: '//127.0.0.1/shareDemo$/' + projectName,
    dist: projectTmpBuildOutput,
    distFonts: projectTmpBuildOutput + '/App/styles/fonts',
    distImages: projectTmpBuildOutput + '/App/images/',
    distScripts: projectTmpBuildOutput + '/App/scripts',
    distStyles: projectTmpBuildOutput + '/App/styles',
    gitUrl: 'https://github.com/digitaldrummerj/GulpForNetDevelopers.git',
    images: app + '/images',
    nodeModules: appRoot + 'node_modules',
    projectTmpBuildOutput: projectTmpBuildOutput,
    styles: app + '/styles',
    tmp: app + '/.tmp',
    tmpBuildDir: tmpBuildDir,
    tmpFonts: app + '/.tmp/fonts'
};

var files = {
    appJs: paths.app + '/app.js',
    assemblyInfoFiles: paths.appRoot + '**/AssemblyInfo.cs',
    bowerComponents: paths.bowerComponents + '/**/*',
    bowerJson: paths.appRoot + 'bower.json',
    dist: paths.dist + '/**/*',
    distCss: paths.distStyles + '/**/*.css',
    distHtml: paths.dist + '/**/*.html',
    distIndexHtml: paths.dist + '/index.html',
    distManifest: paths.dist + '/rev-manifest.json',
    distScripts: paths.distScripts + '/**/*.js',
    favicons: paths.app + '/**/*.ico',
    fonts: paths.app + '/**/*.{eot,svg,ttf,woff}',
    html: paths.app + '/**/*.html',
    html404: paths.app + '/404.html',
    htmlTemplatecache: paths.app + '/**/*.template.html',
    htmlTopLevel: paths.app + '/*.html',
    images: paths.images + '/**/*',
    indexHtml: paths.appRoot + 'index.html',
    json: paths.app + '/**/*.json',
    moduleScripts: paths.app + '/**/*.module.js',
    mainScss: paths.styles + '/main.scss',
    nodeModules: paths.nodeModules + '/**/*',
    packageJson: 'package.json',
    projectTmpBuildOutput: projectTmpBuildOutput  + '/**/*',
    scripts: paths.app + '/**/*.js',
    solutionFiles: '../*.sln',
    styles: paths.app + '/**/*.scss',
    templates: paths.app + '/**/*.html',
    tfs: '"C:\\Program Files (x86)\\Microsoft Visual Studio 14.0\\Common7\\IDE\\tf.exe"',
    tmp: paths.tmp + '/**/*',
    tmpCss: paths.tmp + '/**/*.css',
    tmpFonts: paths.tmpFonts + '/**/*'
};

// groups of globs that are used more than once
var fileCollections = {
    //all application html
    html: [
		files.html,
		'!' + files.nodeModules,
		'!' + files.tmp,
        '!' + files.bowerComponents
    ],
    //all application html except index.html, 404.html, and html templates that are templatecached, all of which are handled differently in the build step	
    htmlRevable: [
		files.html,
		'!' + files.htmlTemplatecache,
		'!' + files.indexHtml,
		'!' + files.html404,
		'!' + files.nodeModules,
		'!' + files.tmp
    ],
    //all application html that will be templatecached
    htmlTemplatecache: [
		files.htmlTemplatecache,
		'!' + files.nodeModules,
		'!' + files.tmp
    ],
    favicons: [
		files.favicons,
		'!' + files.nodeModules,
		'!' + files.tmp
    ],
    json: [
		files.json,
		'!' + files.nodeModules,
		'!' + files.tmp
    ],
    revReplaceFiles: [
		files.distScripts,
		files.distHtml,
		files.distCss
    ],
    scripts: [
		files.scripts,
        files.moduleScripts,
		'!' + files.nodeModules,
		'!' + files.tmp,
        '!' + files.bowerComponents
    ],
    styles: [
		files.styles,
        '!' + files.mainScss,
		'!' + files.nodeModules,
		'!' + files.tmp,
        '!' + files.bowerComponents
    ]
};

function errorHandler(title) {
    return function (err) {
        gulpUtil.log(gulpUtil.colors.red('[' + title + ']'), err.toString());
        this.emit('end');
    };
}


module.exports = {
    projectName: projectName,
    moduleName: moduleName,
    paths: paths,
    files: files,
    fileCollections: fileCollections,
    distRoot: distRoot,
    errorHandler: errorHandler,
    minifyHtml: {
        removeComments: true,
        collapseWhitespace: true,
        collapseBooleanAttributes: true,
        removeEmptyAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        minifyCSS: true,
        minifyJS: true
    },
    iisPort: iisPort 
};
