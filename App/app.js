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
               templateUrl: "app/home/home.html",
               controller: 'HomeController as vm'
           })

         // if none of the above states are matched, use this as the fallback
         $urlRouterProvider.otherwise('/');

     });
    ;
})();

