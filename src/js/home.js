'use strict';

define(['module', 'app/main'], function(module, main) {
    main.register.controller(ngCName(module, 'menuController'), ['$scope', 'levelsData', 'playerData', function($scope, levelsData, playerData) {
        $scope.navBack('/exitInterstitial');
        var savedGameState = $scope.savedGameState = playerData.getGameState();
        $scope.fullOpacityClass = true;
        $scope.savedGameUrl = savedGameState && ('/game/' + savedGameState.levelId);
    }]);
    main.register.controller(ngCName(module, 'levelsController'), ['$scope', '$routeParams', 'levelsData', 'playerData', 'combinedData', '$timeout', function($scope, $routeParams, levelsData, playerData, combinedData, $timeout) {
        $scope.navBack('/home');
        var chapterId = parseInt($routeParams.initialGroup) || '1';
        $scope.chapterId = chapterId;
        var fullChapters = $scope.fullChapters = combinedData.getChaptersExtendedWithUserData();
        $scope.groupedChapters = fullChapters.map(function(chapter) {
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
        $scope.currentIndex = selectedChapterIndex;
        $scope.deltaOffset = 0;

        function includeTransitionClass() {
            $scope.includeTransitionClass = true;
            $timeout(function() {
                $scope.includeTransitionClass = false;
            }, 200);
        }
        function tryChangeChapter(newChapterIndex, returnToBase) {
            if (fullChapters[newChapterIndex]) {
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
            $scope.$apply(function() {
                $scope.deltaOffset = -delta;
            });
        };
        $scope.swipeEnd = function(delta) {
            $scope.$apply(function() {
                var newIndex = Math.round(($scope.screenWidth * $scope.currentIndex - delta) / $scope.screenWidth);
                $scope.deltaOffset = 0;
                tryChangeChapter(newIndex, true);
            });
        };
    }]);
    main.register.controller(ngCName(module, 'exitInterstitialController'), ['$scope', '$routeParams', 
        function($scope, $routeParams) {
            window.plugins.AdMob.createInterstitialView();
            $scope.watchBack(function() {
                navigator.app.exitApp();
            });
            document.addEventListener('onDismissInterstitialAd', function(){ 
                navigator.app.exitApp();
            });
            document.addEventListener('onLeaveToAd', function(){
                navigator.app.exitApp();
            });
        }
    ]);
    main.register.directive('addASpaceBetween', [function () {
            return function (scope, element) {
                if(!scope.$last){
                    element.after('&nbsp;');
                }
            }
        }
    ]);
    main.register.directive('swipePanel', function() {
        return {
            restrict: 'A',
            scope: {
                onSwipeProcess: '&swipePanel',
                onSwipeEnd: '&swipeEnd'
            },
            controller: function ($scope, $element, $attrs) {
                $element.bind('touchstart', onTouchStart);

                var firstMove,
                    startX = 0,
                    lastDelta = 0;

                function onTouchStart(event) {
                    startX = event.touches[0].pageX;
                    $element.bind('touchmove', onTouchMove);
                    $element.bind('touchend', onTouchEnd);
                    firstMove = true;
                }


                function onTouchMove(event) {
                    if (firstMove) {
                        firstMove = false;
                        event.preventDefault();
                    }
                    lastDelta = event.changedTouches[0].pageX - startX;
                    $scope.onSwipeProcess({ delta: lastDelta });
                }

                // Unbinds methods when touch interaction ends
                function onTouchEnd(event) {
                    firstMove = false;
                    $element.unbind('touchmove', onTouchMove);
                    $element.unbind('touchend', onTouchEnd);
                    $scope.onSwipeEnd({ delta: lastDelta });
                }
            }
        };
    });

});