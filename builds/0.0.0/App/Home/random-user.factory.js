(function () {
    'use strict';

    angular
        .module('app')
        .factory('RandomUserService', RandomUserService);

    RandomUserService.$inject = ['$http'];

    function RandomUserService($http) {
        var service = {
            getData: getData
        };

        return service;

        function getData() { }
    }
})();