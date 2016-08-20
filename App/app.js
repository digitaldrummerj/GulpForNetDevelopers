(function () {
    'use strict';

    angular.module('app', [
        // Angular modules
        'ngAnimate',
        'ui.router'

        // Custom modules

        // 3rd Party Modules
        , 'ui.bootstrap'
    ])
     .config(function ($stateProvider, $urlRouterProvider) {

         $stateProvider
           .state('home', {
               url: "/",
               templateUrl: "App/Home/home.html",
               controller: 'HomeController as vm'
           })
           .state('compileSass', { url: "/compile-sass", templateUrl: "App/Task-Details/compile-sass.html" })
         .state('compileProject', { url: "/compile-project", templateUrl: "App/Task-Details/compile-project.html" })
         .state('incrementVersion', { url: "/increment-version", templateUrl: "App/Task-Details/increment-version.html" })
         .state('injectFiles', { url: "/inject-files", templateUrl: "App/Task-Details/inject-files.html" })
         .state('lintJavascript', { url: "/lint-javascript", templateUrl: "App/Task-Details/lint-javascript.html" })
         .state('packageRelease', { url: "/package-release", templateUrl: "App/Task-Details/package-release.html" })
         .state('watchFiles', { url: "/watch-files", templateUrl: "App/Task-Details/watch-files.html" });

         // if none of the above states are matched, use this as the fallback
         $urlRouterProvider.otherwise('/');

     });
    ;
})();

