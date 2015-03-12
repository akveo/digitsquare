define(['angular', 'angular-ui-router', 'angular-touch', 'app/home', 'app/game', 'app/helper', 'app/analytics', 'app/monetize'], function(angular) {
    'use strict';
    
    angular.module('app', [
        'ui.router',
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

    AppConfig.$inject = ['$urlRouterProvider'];
    function AppConfig($urlRouterProvider) {
        $urlRouterProvider.otherwise('/home');
    }

    AppRun.$inject = ['$rootScope', '$timeout', 'panelModal', '$document', '$state', 'screenSettings'];
    function AppRun($rootScope, $timeout, panelModal, $document, $state, screenSettings) {
        $rootScope.goToPath = function(stateName, search) {
            $state.go(stateName, search, { inherit: false, notify: true });
        };
        $rootScope.paddingValue = Math.max(20, Math.ceil(screenSettings.mainContainerWidth / 20));
        
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
        $rootScope.navBack = function(state, search) {
            function onBackKeyDown(evt) {
                evt.preventDefault();
                $rootScope.$apply(function() {
                    $rootScope.goToPath(where, search);
                });
            }

            this.watchBack(onBackKeyDown);
        };

        var statesWithFullOpacityBg = ['home'];
        $rootScope.$on('$stateChangeStart', function(event, toState) {
            $rootScope.fullOpacityClass = statesWithFullOpacityBg.indexOf(toState.name) !== -1;
        });
    }
});