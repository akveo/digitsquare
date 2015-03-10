define(['angular', 'app/data'], function(angular, ads, analytics) {
    'use strict'; 

    angular.module('app.game', ['app.data'])
            .config(gameConfig)
            .controller('GameController', GameController);


    gameConfig.$inject = ['$routeProvider']
    function gameConfig($routeProvider) {
        $routeProvider.when('/game/:levelId', {
            templateUrl: 'views/game/game.html',
            controller: 'GameController'
        });
    }

    GameController.$inject = ['$scope', '$route', '$routeParams', 'levelsData', 'playerData', 'userLevelsData', '$location', '$rootScope', '$window', '$timeout'];
    function GameController($scope, $route, $routeParams, levelsData, playerData, userLevelsData, $location, $rootScope, $window, $timeout) {
        $scope.$emit('pageViewed');

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
            $scope.fieldWidth = newValue - ($scope.paddingValue - 2) * 2; // Minus padding
            $scope.sidePixels = $scope.fieldWidth / sideSize;
            $scope.sideLine = $scope.sidePixels - 4;
            $scope.cellFont = $scope.sideLine / 3 * 2;
        });

        $scope.reloadGame = function() {
            $scope.$emit('analyticsEvent', {
                category: 'Level Status',
                action: 'Retry',
                label: levelId,
                value: $scope.movesCount
            });
            if ($routeParams.skipAd || $routeParams.savedGame) {
                $location.search('');
            } else {
                $route.reload();
            }
        }

        $scope.whenMoved = function(row, column, direction, x, y) {
            if ($scope.levelFinished) 
                return;

            direction = adjustDirection(direction, x, y);
            var moveClasses = {
                u: 'moveUp',
                d: 'moveDown',
                l: 'moveLeft',
                r: 'moveRight'
            };

            initialStateMatrix.forEach(function(el) {
                if (matchesState(el, row, column, direction)) {
                    el.animClass = moveClasses[direction];
                } else {
                    delete el.animClass;
                }
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

        $scope.whenMoveEnd = function(row, column, direction, x, y) {
            if ($scope.levelFinished) 
                return;

            direction = adjustDirection(direction, x, y);
            doMove(row, column, direction);
            if (validateStateArray(currentState, levelData.goal)) {
                $scope.levelFinished = true;
                var saveResult = userLevelsData.completeLevel(levelId, $scope.movesCount);
                $timeout(function() {
                    saveResult.then(function(nextLevelId) {
                        var childScope = angular.extend($rootScope.$new(), {
                            stars: levelsData.getLevelStars(levelData, $scope.movesCount),
                            currentChapter: chapterId,
                            nextLevel: nextLevelId,
                            repeatClicked: function() { $scope.reloadGame(); }
                        });
                        var modal = $scope.panelModal('views/game/nextLevelModal.html', childScope).show();
                    });
                    $scope.$emit('analyticsEvent', {
                        category: 'Level Status',
                        action: 'Completed',
                        label: levelId,
                        value: $scope.movesCount
                    });
                }, 100);
            }
        };

        function adjustDirection(direction, posX, posY) {
            return isMoved(posX, posY) ? direction : '';
        }

        function isMoved(posX, posY) {
            return posX < $scope.boundingRect.left || posX > $scope.boundingRect.right ||
                                posY < $scope.boundingRect.top || posY > $scope.boundingRect.bottom;
        }

        $scope.whenMoveStart = function(boundingRect, x, y, triggerType) {
            $scope.boundingRect = triggerType === 'touch' ?
                                boundingRect :
                                { left: x - 30, right: x + 30, top: y - 30, bottom: y + 30 };
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

        $scope.showGoalThroughModal = levelId == '1-1';
        if (levelId == '1-1') {
            $timeout(function() {
                function modalCloseCallback() {
                    $scope.showGoalThroughModal = false;
                }

                var options = { callback: modalCloseCallback };
                $scope.panelModal('views/game/startGameTutorial.html', $rootScope.$new(), options)
                    .show();
            }, 0);
        }
    }

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

});