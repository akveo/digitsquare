define(['angular', 'angular-ui-router', 'angular-swipe-element', 'app/util', 'app/data'], function(angular) {
    'use strict';

    angular.module('app.home', ['ui.router', 'app.data', 'app.util', 'angular-swipe-element'])
            .config(homeConfig)
            .factory('levelsDataAdapter', levelsDataAdapter)
            .controller('MenuController', MenuController)
            .controller('LevelsController', LevelsController)
            .controller('ExitIntersititalController', ExitInterstitialController);

    homeConfig.$inject = ['$stateProvider'];
    function homeConfig($stateProvider) {
        $stateProvider
            .state('home', {
                url: '/home',
                templateUrl: 'views/home/menu.html',
                controller: 'MenuController',
                controllerAs: 'vm'
            })
            .state('levels', {
                url: '/levels',
                templateUrl: 'views/home/levels.html',
                controller: 'LevelsController',
                controllerAs: 'vm'
            })
            .state('exitInterstitial', {
                url: '/exitInterstitial',
                templateUrl: 'views/home/exitInterstitial.html',
                controller: 'ExitInterstitialController'
            })
            .state('help', {
                url: '/help',
                templateUrl: 'views/home/help.html'
            })
            .state('about', {
                url: '/about',
                templateUrl: 'views/home/about.html'
            });
    }

    levelsDataAdapter.$inject = ['userLevelsData'];
    function levelsDataAdapter(userLevelsData) {
        return {
            getAdapterLevelsObject: function(chapterId) {
                return userLevelsData.getChaptersExtendedWithUserData().then(function(fullChapters) {
                    var res = {};
                    res.fullChapters = fullChapters;
                    res.groupedChapters = fullChapters.map(function(chapter) {
                        return chapter.chapterLevels.reduce(function(acc, val, i) {
                            var index = Math.floor(i / 5);
                            if (!acc[index]) acc[index] = [];
                            acc[index].push(val);
                            return acc;
                        } , []); 
                    });
                    var selectedChapterIndex = 0;
                    fullChapters.forEach(function(c, i) { 
                        if (c.id == chapterId) {
                            selectedChapterIndex = i;
                        }
                    });
                    res.currentIndex = selectedChapterIndex || 0;
                    return res;
                });
            }
        }
    }

    MenuController.$inject = ['$scope', 'playerData', '$rootScope', 'exitApp'];
    function MenuController($scope, playerData, $rootScope, exitApp) {
        $scope.$emit('pageViewed', 'Home');
        $scope.watchBack(exitApp);

        var vm = this;
        
        playerData.getGameState().then(function(savedGameState) {
            vm.savedGameState = savedGameState;
            vm.savedGameLevelId = savedGameState.levelId;
            vm.savedGameUrl = savedGameState && ('/game/' + savedGameState.levelId);
        });
    }

    LevelsController.$inject = ['$scope', '$stateParams', 'levelsDataAdapter', '$timeout', 'styleBuilder', 'screenSettings'];
    function LevelsController($scope, $stateParams, levelsDataAdapter, $timeout, styleBuilder, screenSettings) {
        $scope.$emit('pageViewed', 'Levels');
        $scope.navBack('home');

        var vm = this;
        var chapterId = vm.chapterId = parseInt($stateParams.initialGroup || '1') ;
        levelsDataAdapter.getAdapterLevelsObject(chapterId).then(function(res) {
            angular.extend(vm, res);
        });
        vm.deltaOffset = 0;
        vm.currentIndex = 0;

        vm.getChaptersContainerStyles = function() {
            var chaptersLength = vm.fullChapters && vm.fullChapters.length;
            return styleBuilder().translate3dX(-screenSettings.mainContainerWidth * vm.currentIndex + vm.deltaOffset).style('width', screenSettings.mainContainerWidth * chaptersLength + 'px').build();
        };
        vm.chapterStyles = { width: screenSettings.mainContainerWidth + 'px'};

        function includeTransitionClass() {
            vm.includeTransitionClass = true;
            $timeout(function() {
                vm.includeTransitionClass = false;
            }, 200);
        }
        function tryChangeChapter(newChapterIndex, returnToBase) {
            if (vm.fullChapters[newChapterIndex]) {
                vm.currentIndex = newChapterIndex;
            } else if (returnToBase) {
                vm.currentIndex = vm.currentIndex;
            }
            includeTransitionClass();
        }
        vm.goToChapter = function(newChapterIndex) {
            tryChangeChapter(newChapterIndex);
        };
        vm.swipeProcess = function(delta) {
            vm.deltaOffset = delta;
        };
        vm.swipeEnd = function(delta) {
            var newIndex = Math.round((screenSettings.mainContainerWidth * vm.currentIndex - delta) / screenSettings.mainContainerWidth);
            vm.deltaOffset = 0;
            tryChangeChapter(newIndex, true);
        };
    }

    ExitInterstitialController.$inject = ['$scope', '$document', 'exitApp'];
    function ExitInterstitialController($scope, $document, exitApp) {
        $scope.$emit('forceInterstitialAdShow');
        $scope.watchBack(exitApp);
        $document.on('onDismissInterstitialAd', exitApp);
        $document.on('onLeaveToAd', exitApp);
    }
});