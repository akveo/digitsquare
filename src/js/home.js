'use strict';

define(['module', 'app/main'], function(module, main) {
    main.register.controller(ngCName(module, 'menuController'), ['$scope', 'levelsData', 'playerData', function($scope, levelsData, playerData) {
        var savedGameState = $scope.savedGameState = playerData.getGameState();
        $scope.fullOpacityClass = true;
        $scope.savedGameUrl = savedGameState && ('/game/' + savedGameState.chapterId + '/' + savedGameState.levelId);
    }]);
    main.register.controller(ngCName(module, 'levelsController'), ['$scope', '$routeParams', 'levelsData', 'playerData', 'combinedData', '$timeout', function($scope, $routeParams, levelsData, playerData, combinedData, $timeout) {
        var chapterId = parseInt($routeParams.initialGroup) || '1';
        $scope.chapterId = chapterId;
        var fullChapters = $scope.fullChapters = combinedData.getChaptersExtendedWithUserData();
        var selectedChapterIndex = 0;
        fullChapters.forEach(function(c, i) { 
            if (c.id == chapterId) {
                selectedChapterIndex = i;
            }
        });
        $scope.currentIndex = selectedChapterIndex;
        $scope.offsetX = screen.availWidth * selectedChapterIndex;

        function includeTransitionClass() {
            $scope.includeTransitionClass = true;
            $timeout(function() {
                $scope.includeTransitionClass = false;
            }, 200);
        }
        function tryChangeChapter(newChapterIndex, returnToBase) {
            if (fullChapters[newChapterIndex]) {
                $scope.currentIndex = newChapterIndex;
                $scope.offsetX = screen.availWidth * newChapterIndex;
                includeTransitionClass();
            } else if (returnToBase) {
                $scope.offsetX = screen.availWidth * $scope.currentIndex;
                includeTransitionClass();
            }
        }
        $scope.goToChapter = function(newChapterIndex) {
            tryChangeChapter(newChapterIndex);
        };
        $scope.swipeProcess = function(delta) {
            $scope.$apply(function() {
                $scope.offsetX = screen.availWidth * $scope.currentIndex - delta;
            });
        };
        $scope.swipeEnd = function(delta) {
            $scope.$apply(function() {
                var newIndex = Math.round((screen.availWidth * $scope.currentIndex - delta) / screen.availWidth);
                tryChangeChapter(newIndex, true);
            });
        };
    }]);
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