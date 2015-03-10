define(['angular', 'angular-route', 'angular-touch', 'app/home', 'app/game', 'app/helper', 'app/analytics', 'app/monetize'], function(angular) {
    'use strict';
    
    angular.module('app', [
        'ngRoute',
        'ngTouch',

        /* Modules that represent pages */
        'app.helper',
        'app.home',
        'app.game',

        /* Optional modules */
        'app.analytics',
        'app.monetize'
    ])
    .config(AppConfig)
    .run(AppRun);

    AppConfig.$inject = ['$routeProvider'];
    function AppConfig($routeProvider) {
        $routeProvider.otherwise({ redirectTo: '/home' });
    }

    AppRun.$inject = ['$rootScope', '$location', '$timeout', 'panelModal', '$document'];
    function AppRun($rootScope, $location, $timeout, panelModal, $document) {
        $rootScope.goToPath = function(url, search) {
            $location.path(url);
            $location.search(search || '');
        };
        var sWidth = document.documentElement.clientWidth || screen.width;
        $rootScope.screenWidth = sWidth > 500 ? 500 : sWidth;
        $rootScope.normalScreenWidth = sWidth > 768 ? 768 : sWidth;
        $rootScope.sizeK = sWidth >= 500 ? 1.5 : 1;
        $rootScope.screenHeight = document.documentElement.clientHeight || screen.height;
        $rootScope.paddingValue = Math.max(20, Math.ceil($rootScope.normalScreenWidth / 20));
        $rootScope.screenWithoutPadding = sWidth - $rootScope.paddingValue * 2;
        $rootScope.isPhoneGap = isPhoneGap();
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
            $document.on('backbutton', listener);
            this.$on('$destroy', function() {
                $document.off('backbutton', listener);
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
    }
});