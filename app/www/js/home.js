'use strict';

define(['module', 'app/main', 'app/analytics'], function(module, main, analytics) {
    main.register.controller(ngCName(module, 'menuController'), ['$scope', 'playerData', '$rootScope', function($scope, playerData, $rootScope) {
        analytics.pageViewed('Home');
        $scope.watchBack(function() {
            navigator.app.exitApp();
        });
        $rootScope.fullOpacityClass = true;
        playerData.getGameState().then(function(savedGameState) {
            $scope.savedGameState = savedGameState;
            $scope.savedGameUrl = savedGameState && ('/game/' + savedGameState.levelId);
        });
        $scope.$on('$destroy', function() {
            $rootScope.fullOpacityClass = false;
        });
    }]);
    main.register.controller(ngCName(module, 'levelsController'), ['$scope', '$routeParams', 'combinedData', '$timeout', function($scope, $routeParams, combinedData, $timeout) {
        analytics.pageViewed('Levels');
        $scope.navBack('/home');
        var chapterId = parseInt($routeParams.initialGroup) || '1';
        $scope.chapterId = chapterId;
        combinedData.getChaptersExtendedWithUserData().then(function(fullChapters) {
            $scope.fullChapters = fullChapters;
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
    main.register.controller(ngCName(module, 'helpController'), function(){});
    main.register.controller(ngCName(module, 'aboutController'), function(){});
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
            controller: function ($scope, $element, $attrs, $document) {
                $element.bind('touchstart', onTouchStart);
                $element.bind('mousedown', onMouseDown);

                var firstMove,
                    startX = 0,
                    lastDelta = 0,
                    touchJustStarted = false;

                function onStart(xPos) {
                    startX = xPos;
                    firstMove = true;
                    touchJustStarted = true;
                }

                function onTouchStart(event) {
                    onStart(event.touches[0].pageX);
                    $element.bind('touchmove', onTouchMove);
                    $element.bind('touchend', onTouchEnd);
                }

                function onMouseDown(event) {
                    onStart(event.screenX);
                    $document.bind('mousemove', onMouseMove);
                    $document.bind('mouseup', onMouseUp);
        }

                function onMove(xPos) {
                    lastDelta = xPos - startX;
                    if (touchJustStarted && Math.abs(lastDelta) < 4) {
                        return;
                    }
                    touchJustStarted = false;
                    $scope.onSwipeProcess({ delta: lastDelta });
                }

                function onTouchMove(event) {
                    if (firstMove) {
                        firstMove = false;
                        event.preventDefault();
                    }
                    onMove(event.changedTouches[0].pageX);
                }

                function onMouseMove(event) {
                    onMove(event.screenX);
                }

                function onEnd() {
                    firstMove = false;
                    touchJustStarted = false;
                    $scope.onSwipeEnd({ delta: lastDelta });
                }

                // Unbinds methods when touch interaction ends
                function onTouchEnd(event) {
                    $element.unbind('touchmove', onTouchMove);
                    $element.unbind('touchend', onTouchEnd);
                    onEnd();
                }

                function onMouseUp() {
                    $document.unbind('mousemove', onMouseMove);
                    $document.unbind('mouseup', onMouseUp);
                    onEnd();
                }
            }
        };
    });

});