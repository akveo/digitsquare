'use strict';

define(['module', 'app/main', 'angular'], function(module, main, angular) {

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
            .controller(ngCName(module, 'gameController'), function($scope, $route, $routeParams, levelsData, playerData, combinedData, $location) {
                var chapterId = $routeParams.chapterId,
                    levelId = $routeParams.levelId,
                    levelData = levelsData.getLevel(chapterId, levelId),
                    currentState = levelData.initial;

                if ($routeParams.savedGame) {
                    var savedGameState = playerData.getGameState();
                    currentState = savedGameState.currentState;
                }


                var sideSize = Math.sqrt(currentState.length),
                    initialStateMatrix = prepareStateMatrix(currentState, sideSize),
                    currentStateObj = { 
                        chapterId: chapterId,
                        levelId: levelId,
                        currentState: currentState
                    };

                $scope.chapterId = parseInt($routeParams.chapterId);
                $scope.levelId = $routeParams.levelId;
                $scope.movesCount = 0;

                if (Math.round(sideSize) === sideSize) {
                    $scope.initialStateMatrix = initialStateMatrix;
                    $scope.sideSize = sideSize;
                    $scope.sideSizePercent = (100 / sideSize) + '%';
                } else {
                    throw Error('Not valid matrix initial state!');
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
                            el.row = (el.row - 1 + sideSize) % sideSize;
                        },
                        d: function(el) {
                            el.row = (el.row + 1 + sideSize) % sideSize;
                        },
                        l: function(el) {
                            el.column = (el.column - 1 + sideSize) % sideSize;
                        },
                        r: function(el) {
                            el.column = (el.column + 1 + sideSize) % sideSize;
                        }
                    };
                    $scope.$apply(function() {
                        initialStateMatrix.forEach(function(el) {
                            if (matchesState(el, row, column, direction)) {
                                moveFunctions[direction](el);
                            }
                            delete el.animClass;
                        });
                        $scope.movesCount++;
                        currentState = stateMatrixToStateArray(initialStateMatrix, sideSize);
                        currentStateObj.currentState = currentState;
                        playerData.updateGameState(currentStateObj);
                    });
                };

                $scope.whenAnimationEnd = function() {
                    if (validateStateArray(currentState, levelData.goal)) {
                        alert("Nice job! Press 'OK' to go to the next level.");
                        var nextLevelInfo = combinedData.completeLevel(chapterId, levelId, $scope.movesCount);
                        $scope.$apply(function() {
                            $location.path('/game/' + nextLevelInfo.chapterId + '/' + nextLevelInfo.levelId);
                        });
                    }
                }

                playerData.updateGameState(currentStateObj);

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

                        function onTouchStart(event) {
                            event.preventDefault();

                            $scope.startX = event.touches[0].pageX;
                            $scope.startY = event.touches[0].pageY;
                            $scope.boundingRect = $element[0].getBoundingClientRect();
                            $scope.parent = $element.parent()[0];
                            $element.bind('touchmove', onTouchMove);
                            $element.bind('touchend', onTouchEnd);
                        }

                        function onTouchMove(event) {

                            event.preventDefault();
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
                            event.preventDefault();
                            $element.unbind('touchmove', onTouchMove);
                            $element.unbind('touchend', onTouchEnd);
                            $element.bind('transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd', onTransitionEnd);
                            $scope.onMoveEnd({ direction: $scope.direction });
                        }
                    }
                }
            });
});