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
               templateUrl: "app/Home/home.html",
               controller: 'HomeController as vm'
           })
           .state('compileSass', { url: "/compile-sass", templateUrl: "app/Task-Details/compile-sass.html" })
         .state('compileProject', { url: "/compile-project", templateUrl: "app/Task-Details/compile-project.html" })
         .state('incrementVersion', { url: "/increment-version", templateUrl: "app/Task-Details/increment-version.html" })
         .state('injectFiles', { url: "/inject-files", templateUrl: "app/Task-Details/inject-files.html" })
         .state('lintJavascript', { url: "/lint-javascript", templateUrl: "app/Task-Details/lint-javascript.html" })
         .state('packageRelease', { url: "/package-release", templateUrl: "app/Task-Details/package-release.html" })
         .state('watchFiles', { url: "/watch-files", templateUrl: "app/Task-Details/watch-files.html" });

         // if none of the above states are matched, use this as the fallback
         $urlRouterProvider.otherwise('/');

     });
    ;
})();

