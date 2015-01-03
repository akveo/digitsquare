'use strict';

define(['module', 'app/main', 'angular', 'app/ads', 'app/analytics'], function(module, main, angular, ads, analytics) {

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
                } else {
                    analytics.pageViewed('Game');
                }
                var levelId = $routeParams.levelId,
                    chapterId = levelId.split('-')[0],
                    levelIndex = levelId.split('-')[1],
                    levelData = levelsData.getLevel(levelId),
                    currentState = levelData.initial,
                    movesCount = 0;

                if ($routeParams.savedGame) {
                    playerData.getGameState().then(function(savedGameState) {
                        $scope.initialStateMatrix = initialStateMatrix = prepareStateMatrix(savedGameState.currentState, sideSize);
                        $scope.movesCount = savedGameState.movesCount || 0;    
                    });
                }

                var sideSize = Math.sqrt(currentState.length),
                    initialStateMatrix = prepareStateMatrix(currentState, sideSize),
                    currentStateObj = { 
                        levelId: levelId,
                        currentState: currentState,
                        movesCount: movesCount
                    };
                if (!$routeParams.savedGame) {
                    playerData.updateGameState(currentStateObj);
                }
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
                    analytics.trackEvent('Level Status', 'Retry', levelId, $scope.movesCount);
                    if ($routeParams.skipAd || $routeParams.savedGame) {
                        $location.search('');
                    } else {
                        $route.reload();
                    }
                }

                $scope.whenMoved = function(row, column, direction) {
                    if ($scope.levelFinished) 
                        return;

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

                function doMove(row, column, direction) {
                    if ($scope.levelFinished) 
                        return;
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
                    }
                }

                $scope.whenMoveEnd = function(row, column, direction) {
                    $scope.$apply(function() {
                        doMove(row, column, direction);
                    });
                    if (validateStateArray(currentState, levelData.goal)) {
                        $scope.levelFinished = true;
                        var saveResult = combinedData.completeLevel(levelId, $scope.movesCount);
                        $timeout(function() {
                            saveResult.then(function(nextLevelId) {
                                var childScope = angular.extend($rootScope.$new(), {
                                    stars: levelsData.getLevelStars(levelData, $scope.movesCount),
                                    currentChapter: chapterId,
                                    nextLevel: nextLevelId,
                                    repeatClicked: function() { $scope.reloadGame(); }
                                });
                                var modal = $scope.panelModal('views/game/nextLevelModal.html', childScope);
                                modal.show();
                            });    
                            analytics.trackEvent('Level Status', 'Completed', levelId, $scope.movesCount);
                        }, 100);
                    }
                };

                $scope.randomNShifts = function() {
                    var shifts = 50;
                    for (var i =0; i < shifts; i++) {
                        var col = Math.ceil(Math.random() * sideSize) - 1,
                            row = Math.ceil(Math.random() * sideSize) - 1,
                            direction = (['u', 'd', 'l', 'r'])[Math.ceil(Math.random() * 4 ) - 1];
                        doMove(row, col, direction);
                    }
                    console.log(currentState);
                    console.log(currentState.map(function(el) { return el || '-'}).join(''));
                }

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
                        onMoveNode: '&swipeCellOnMove'
                    },
                    controller: function ($scope, $element, $attrs, $document) {
                        $element.bind('touchstart', onTouchStart);
                        $element.bind('mousedown', onMouseDown);
                        var firstMove;

                        function _onDown(x, y) {
                            $scope.startX = x;
                            $scope.startY = y;
                        }
                        function onTouchStart(event) {
                            _onDown(event.touches[0].pageX, event.touches[0].pageY);
                            $scope.boundingRect = $element[0].getBoundingClientRect();
                            $element.bind('touchmove', onTouchMove);
                            $element.bind('touchend', onTouchEnd);
                            firstMove = true;
                        }
                        function onMouseDown(event) {
                            var x = event.screenX,
                                y = event.screenY;
                            _onDown(x, y);
                            $scope.boundingRect = { left: x - 30, right: x + 30, top: y - 30, bottom: y + 30 };
                            $document.bind('mousemove', onMouseMove);
                            $document.bind('mouseup', onMouseUp);
                        }


                        function _onMove(x, y) {
                            var direction = '',
                                posX = x,
                                posY = y,
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
                        function onTouchMove(event) {
                            if (firstMove) {
                                firstMove = false;
                                event.preventDefault();
                            }
                            _onMove(event.changedTouches[0].pageX, event.changedTouches[0].pageY);
                        }
                        function onMouseMove(event) {
                            _onMove(event.screenX, event.screenY);
                        }


                        // Unbinds methods when touch interaction ends
                        function _onEnd() {
                            $scope.onMoveEnd({ direction: $scope.direction });
                        }
                        function onTouchEnd(event) {
                            firstMove = false;
                            $element.unbind('touchmove', onTouchMove);
                            $element.unbind('touchend', onTouchEnd);
                            _onEnd();
                        }
                        function onMouseUp(event) {
                            $document.unbind('mousemove', onMouseMove);
                            $document.unbind('mouseup', onMouseUp);
                            _onEnd();
                        }
                    }
                }
            });

});