'use strict';

define(['module', 'app/main', 'angular', 'app/ads'], function(module, main, angular, ads) {

    function prepareStateMatrix(stateArray, sideSize) {
        return stateArray.map(function(label, index) {
            return {
                label: label,
                row: Math.floor(index / sideSize),
                column: index % sideSize
            };
        });
    }

    function stateMatrixToStateArray(stateMatrix, sideSize) {
        var res = [];
        stateMatrix.forEach(function(el, index) {
            res[el.row * sideSize + el.column] = el.label;
        })
        return res;
    }

    function validateStateArray(stateArray, goalArray) {
        return stateArray.reduce(function(agg, element, index) {
            return agg && element == goalArray[index];
        }, true)
    }

    function matchesState(el, row, column, direction) {
        return (['u', 'd'].indexOf(direction) != -1 && el.column == column) ||
                    (['l', 'r'].indexOf(direction) != -1 && el.row == row);
    }

    main.register
            .controller(ngCName(module, 'gameController'), function($scope, $route, $routeParams, levelsData, playerData, combinedData, $location, $rootScope, $window, $timeout) {
                if (!$routeParams.skipAd) {
                    ads.tryShowInterstitialAd();
                }
                var levelId = $routeParams.levelId,
                    chapterId = levelId.split('-')[0],
                    levelIndex = levelId.split('-')[1],
                    levelData = levelsData.getLevel(levelId),
                    currentState = levelData.initial,
                    savedGameState = playerData.getGameState(),
                    movesCount = 0;

                if ($routeParams.savedGame) {
                    currentState = savedGameState.currentState;
                    movesCount = savedGameState && savedGameState.movesCount || 0;
                }

                var sideSize = Math.sqrt(currentState.length),
                    initialStateMatrix = prepareStateMatrix(currentState, sideSize),
                    currentStateObj = { 
                        levelId: levelId,
                        currentState: currentState,
                        movesCount: movesCount
                    };
                $scope.navBack('/levels', 'initialGroup=' + chapterId);
                $scope.chapterId = parseInt(chapterId);
                $scope.levelId = $routeParams.levelId;
                $scope.movesCount = currentStateObj.movesCount;
                $scope.goalArray = levelData.goal;

                if (Math.round(sideSize) === sideSize) {
                    $scope.initialStateMatrix = initialStateMatrix;
                    $scope.sideSize = sideSize;
                    $scope.sideSizePercent = (100 / sideSize) + '%';
                } else {
                    throw Error('Not valid matrix initial state!');
                }

                $scope.$watch('screenWidth', function(newValue, oldValue) {
                    $scope.fieldWidth = newValue - 36; // Minus padding
                    $scope.sidePixels = $scope.fieldWidth / sideSize;
                    $scope.sideLine = $scope.sidePixels - 4;
                    $scope.cellFont = $scope.sideLine / 3 * 2;
                });

                $scope.reloadGame = function() {
                    if ($routeParams.skipAd || $routeParams.savedGame) {
                        $location.search('');
                    } else {
                        $route.reload();
                    }
                }

                $scope.whenMoved = function(row, column, direction) {
                    var moveClasses = {
                        u: 'moveUp',
                        d: 'moveDown',
                        l: 'moveLeft',
                        r: 'moveRight'
                    };

                    $scope.$apply(function() {
                        initialStateMatrix.forEach(function(el) {
                            if (matchesState(el, row, column, direction)) {
                                el.animClass = moveClasses[direction];
                            } else {
                                delete el.animClass;
                            }
                        });
                    });
                };

                $scope.whenMoveEnd = function(row, column, direction) {
                    var moveFunctions = {
                        u: function(el) {
                            if (el.row - 1 < 0) el.animClass = 'transferred';
                            el.row = (el.row - 1 + sideSize) % sideSize;
                        },
                        d: function(el) {
                            if (el.row + 1 >= sideSize) el.animClass = 'transferred';
                            el.row = (el.row + 1 + sideSize) % sideSize;
                        },
                        l: function(el) {
                            if (el.column - 1 < 0) el.animClass = 'transferred';
                            el.column = (el.column - 1 + sideSize) % sideSize;
                        },
                        r: function(el) {
                            if (el.column + 1 >= sideSize) el.animClass = 'transferred';
                            el.column = (el.column + 1 + sideSize) % sideSize;
                        }
                    };
                    if (direction) {
                        $scope.$apply(function() {
                            initialStateMatrix.forEach(function(el) {
                                delete el.animClass;
                                if (matchesState(el, row, column, direction)) {
                                    moveFunctions[direction](el);
                                }
                            });
                            $scope.movesCount++;
                            currentState = stateMatrixToStateArray(initialStateMatrix, sideSize);
                            currentStateObj.currentState = currentState;
                            currentStateObj.movesCount = $scope.movesCount;
                            playerData.updateGameState(currentStateObj);
                        });
                    }
                };

                $scope.whenAnimationEnd = function() {
                    if (validateStateArray(currentState, levelData.goal)) {
                        var nextLevelId = combinedData.completeLevel(levelId, $scope.movesCount);
                        var childScope = angular.extend($rootScope.$new(), {
                            stars: levelsData.getLevelStars(levelData, $scope.movesCount),
                            currentChapter: chapterId,
                            nextLevel: nextLevelId,
                            repeatClicked: function() { $scope.reloadGame(); }
                        });
                        var modal = $scope.panelModal('views/game/nextLevelModal.html', childScope);
                        modal.show();
                    }
                }

                playerData.updateGameState(currentStateObj);
                if (levelId == '1-1') {
                    $timeout(function() {
                        $scope.panelModal('views/game/startGameTutorial.html', $rootScope.$new())
                            .show();
                    }, 0);
                }

            });
    main.register.directive('swipeCell', function() {
                return {
                    restrict: 'A',
                    scope: {
                        onMoveEnd: '&swipeCell',
                        onMoveNode: '&swipeCellOnMove',
                        onAnimationEnd: '&swipeCellAnimationEnd'
                    },
                    controller: function ($scope, $element, $attrs) {
                        $element.bind('touchstart', onTouchStart);

                        var firstMove;

                        function onTouchStart(event) {
                            $scope.startX = event.touches[0].pageX;
                            $scope.startY = event.touches[0].pageY;
                            $scope.boundingRect = $element[0].getBoundingClientRect();
                            $scope.parent = $element.parent()[0];
                            $element.bind('touchmove', onTouchMove);
                            $element.bind('touchend', onTouchEnd);
                            firstMove = true;
                        }

                        function onTouchMove(event) {
                            if (firstMove) {
                                firstMove = false;
                                event.preventDefault();
                            }
                            var direction = '',
                                posX = event.changedTouches[0].pageX,
                                posY = event.changedTouches[0].pageY,
                                deltaX = posX - $scope.startX,
                                deltaY = posY - $scope.startY,
                                absDeltaX = Math.abs(deltaX),
                                absDeltaY = Math.abs(deltaY);

                            function isMoved() {
                                return posX < $scope.boundingRect.left || posX > $scope.boundingRect.right ||
                                        posY < $scope.boundingRect.top || posY > $scope.boundingRect.bottom;
                            }

                            if (isMoved()) {
                                if (absDeltaY > absDeltaX) {
                                    direction = deltaY > 0 ? 'd' : 'u';
                                } else {
                                    direction = deltaX > 0 ? 'r' : 'l';
                                }
                            }
                            
                            if ($scope.direction != direction) {
                                $scope.onMoveNode({ direction: direction });
                            }
                            $scope.direction = direction;
                        }

                        function onTransitionEnd(event) {
                            $element.unbind('transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd', onTransitionEnd);
                            $scope.onAnimationEnd();
                        }

                        // Unbinds methods when touch interaction ends
                        function onTouchEnd(event) {
                            firstMove = false;
                            $element.unbind('touchmove', onTouchMove);
                            $element.unbind('touchend', onTouchEnd);
                            $element.bind('transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd', onTransitionEnd);
                            $scope.onMoveEnd({ direction: $scope.direction });
                        }
                    }
                }
            });

});