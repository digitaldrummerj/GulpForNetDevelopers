(function () {
    'use strict';

    angular
        .module('app')
        .controller('HomeController', HomeController);

    HomeController.$inject = ['RandomUserService'];

    function HomeController(RandomUserService) {
        var vm = this;
        vm.title = 'home';

        activate();

        function activate() { }
    }
})();
