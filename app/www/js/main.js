'use strict';

define(['angular', 'angular-route', 'angular-touch', 'app/routeResolver', 'app/data', 'app/helper', 'app/ads'], function(angular) {
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
                .when('/levels', route.resolve('home/levels'))
                .when('/exitInterstitial', route.resolve('home/exitInterstitial'))
                .when('/game/:levelId', route.resolve('game/game'))
                .otherwise({ redirectTo: '/home' });

            main.register.filter('range', function() {
                return function(input, total) {
                    total = parseInt(total);
                    for (var i=0; i<total; i++)
                      input.push(i);
                    return input;
                };
            });
        }
    ]).run(function($rootScope, $location, $timeout, panelModal) {
        $rootScope.goToPath = function(url, search) {
            $location.path(url);
            $location.search(search || '');
        };
        $rootScope.screenWidth = document.documentElement.clientWidth || screen.width;
        $rootScope.panelModal = function() {
            var modalInstance = panelModal.apply(null, [].slice.call(arguments));
            this.$on('$destroy', function() {
                if (!modalInstance.isDestroyed()) {
                    modalInstance.destroy();
                }
            });
            return modalInstance;
        };
        $rootScope.watchBack = function(listener) {
            document.addEventListener("backbutton", listener, false);
            this.$on('$destroy', function() {
                document.removeEventListener("backbutton", listener);
            });
        };
        $rootScope.navBack = function(where, search) {
            function onBackKeyDown(evt) {
                evt.preventDefault();
                $rootScope.$apply(function() {
                    $rootScope.goToPath(where, search);
                });
            }

            $rootScope.watchBack(onBackKeyDown);
        };
    });



    return main;
});