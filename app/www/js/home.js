define(['angular', 'angular-swipe-element', 'app/util', 'app/data'], function(angular) {
    'use strict';

    angular.module('app.home', ['app.data', 'app.util', 'angular-swipe-element'])
            .config(homeConfig)
            .factory('levelsDataAdapter', levelsDataAdapter)
            .controller('MenuController', MenuController)
            .controller('LevelsController', LevelsController)
            .controller('ExitIntersititalController', ExitInterstitialController);

    homeConfig.$inject = ['$routeProvider'];
    function homeConfig($routeProvider) {
        $routeProvider.when('/home', {
            templateUrl: 'views/home/menu.html',
            controller: 'MenuController'
        }).when('/levels', {
            templateUrl: 'views/home/levels.html',
            controller: 'LevelsController'
        }).when('/exitInterstitial', {
            templateUrl: 'views/home/exitInterstitial.html',
            controller: 'ExitInterstitialController'
        }).when('/help', {
            templateUrl: 'views/home/help.html'
        }).when('/about', {
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
        $rootScope.fullOpacityClass = true;
        playerData.getGameState().then(function(savedGameState) {
            $scope.savedGameState = savedGameState;
            $scope.savedGameUrl = savedGameState && ('/game/' + savedGameState.levelId);
        });
        $scope.$on('$destroy', function() {
            $rootScope.fullOpacityClass = false;
        });
    }

    LevelsController.$inject = ['$scope', '$routeParams', 'levelsDataAdapter', '$timeout'];
    function LevelsController($scope, $routeParams, levelsDataAdapter, $timeout) {
        $scope.$emit('pageViewed', 'Levels');
        $scope.navBack('/home');
        var chapterId = $scope.chapterId = parseInt($routeParams.initialGroup || '1') ;
        levelsDataAdapter.getAdapterLevelsObject(chapterId).then(function(res) {
            angular.extend($scope, res);
        });
        $scope.deltaOffset = 0;

        function includeTransitionClass() {
            $scope.includeTransitionClass = true;
            $timeout(function() {
                $scope.includeTransitionClass = false;
            }, 200);
        }
        function tryChangeChapter(newChapterIndex, returnToBase) {
            if ($scope.fullChapters[newChapterIndex]) {
                $scope.currentIndex = newChapterIndex;
            } else if (returnToBase) {
                $scope.currentIndex = $scope.currentIndex;
            }
            includeTransitionClass();
        }
        $scope.goToChapter = function(newChapterIndex) {
            tryChangeChapter(newChapterIndex);
        };
        $scope.swipeProcess = function(delta) {
            $scope.deltaOffset = -delta;
        };
        $scope.swipeEnd = function(delta) {
            var newIndex = Math.round(($scope.screenWidth * $scope.currentIndex - delta) / $scope.screenWidth);
            $scope.deltaOffset = 0;
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