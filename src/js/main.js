'use strict';

define(['angular', 'angular-route', 'angular-touch', 'app/routeResolver', 'app/data', 'app/helper'], function(angular) {
    var main = angular.module('rubyDigits', [
            'ngRoute',
            'ngTouch',
            'routeResolverServices',
            'digitsData',
            'helper'
        ]);

    main.config(['$routeProvider', 'routeResolverProvider', '$controllerProvider', '$compileProvider', '$filterProvider', '$provide', 
        function($routeProvider, routeResolverProvider, $controllerProvider, $compileProvider, $filterProvider, $provide) {
            main.register = {
                controller: $controllerProvider.register,
                directive: $compileProvider.directive,
                filter: $filterProvider.register,
                factory: $provide.factory,
                service: $provide.service
            };

            var route = routeResolverProvider.route;
            $routeProvider
                .when('/home', route.resolve('home/menu'))
                .when('/levels', { redirectTo: '/levels/1' })
                .when('/levels/:groupId', route.resolve('home/levels'))
                .when('/game/:levelId', route.resolve('game/game'))
                .otherwise({ redirectTo: '/home' });
        }
    ]).run(function($rootScope, $location) {
        $rootScope.goToPath = function(url, search) {
            $location.path(url);
            search && $location.search(search);
        };
    });

    return main;
});