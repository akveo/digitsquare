define(['angular', 'angular-ui-router', 'app/data'], function(angular) {
    'use strict'; 

    angular.module('app.game', ['app.data', 'angular-swipe-element', 'ui.router'])
            .config(gameConfig)
            .factory('fieldStateObject', fieldStateObject)
            .controller('GameController', GameController);


    gameConfig.$inject = ['$stateProvider']
    function gameConfig($stateProvider) {
        $stateProvider
            .state('game', {
                url: '/game/:levelId?savedGame&skipAd',
                templateUrl: 'views/game/game.html',
                controller: 'GameController',
                controllerAs: 'vm',
                resolve: {
                    gameStateObject: gameStateObject
                }
            });

    }

    function fieldStateObject() {

        var moveClasses = {
            u: 'moveUp',
            d: 'moveDown',
            l: 'moveLeft',
            r: 'moveRight'
        };
        var moveFunctions = {
            u: function(el, sideSize) {
                if (el.row - 1 < 0) el.animClass = 'transferred';
                el.row = (el.row - 1 + sideSize) % sideSize;
            },
            d: function(el, sideSize) {
                if (el.row + 1 >= sideSize) el.animClass = 'transferred';
                el.row = (el.row + 1 + sideSize) % sideSize;
            },
            l: function(el, sideSize) {
                if (el.column - 1 < 0) el.animClass = 'transferred';
                el.column = (el.column - 1 + sideSize) % sideSize;
            },
            r: function(el, sideSize) {
                if (el.column + 1 >= sideSize) el.animClass = 'transferred';
                el.column = (el.column + 1 + sideSize) % sideSize;
            }
        };

        function matchesState(el, row, column, direction) {
            return (['u', 'd'].indexOf(direction) != -1 && el.column == column) ||
                        (['l', 'r'].indexOf(direction) != -1 && el.row == row);
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

        function _matrix(currentState) {
            var sideSize = this.sideSize = Math.sqrt(currentState.length);
            this.matrix = prepareStateMatrix(currentState, sideSize);
        }

        _matrix.prototype.toStateArray = function() {
            var res = [];
            this.matrix.forEach(function(el, index) {
                res[el.row * this.sideSize + el.column] = el.label;
            }, this);
            return res;
        };

        _matrix.prototype.validateStateArray = function(stateArray) {
            return this.toStateArray().reduce(function(agg, element, index) {
                return agg && element == stateArray[index];
            }, true);
        };

        _matrix.prototype.invalidateAnimationClasses = function(row, column, direction) {
            this.matrix.forEach(function(el) {
                if (matchesState(el, row, column, direction)) {
                    el.animClass = moveClasses[direction];
                } else {
                    delete el.animClass;
                }
            });
        };

        _matrix.prototype.applyMatrixMove = function(row, column, direction) {
            if (direction) {
                this.matrix.forEach(function(el) {
                    delete el.animClass;
                    if (matchesState(el, row, column, direction)) {
                        moveFunctions[direction](el, this.sideSize);
                    }
                }, this);
            }
        };

        return function(stateArray) {
            return new _matrix(stateArray);
        };
    }

    gameStateObject.$inject = ['$stateParams', 'playerData', 'levelsData', 'fieldStateObject'];
    function gameStateObject($stateParams, playerData, levelsData, fieldStateObject) {
        var levelId = $stateParams.levelId;
        var currentLevel = levelsData.getLevel(levelId);

        var res = {
            levelId: $stateParams.levelId,
            chapterId: levelId.split('-')[0],
            levelIndex: levelId.split('-')[1],
            levelData: currentLevel,
            validateToGoal: function() {
                return this.fieldState.validateStateArray(this.levelData.goal);
            }
        };

        if ($stateParams.savedGame) {
            return playerData.getGameState().then(function(savedGameState) {
                res.fieldState = fieldStateObject(savedGameState.currentState);
                res.movesCount = savedGameState.movesCount || 0;
                res.sideSize = res.fieldState.sideSize;
                return res;
            });
        } else {
            res.fieldState = fieldStateObject(currentLevel.initial);
            res.movesCount = 0;
            res.sideSize = res.fieldState.sideSize;
            return res;
        }
    }

    GameController.$inject = ['$scope', '$state', '$stateParams', 'levelsData', 'playerData', 'userLevelsData', '$rootScope', '$timeout', 'gameStateObject', 'screenSettings', 'styleBuilder'];
    function GameController($scope, $state, $stateParams, levelsData, playerData, userLevelsData, $rootScope, $timeout, gs, screenSettings, styleBuilder) { 
        var sideSize = gs.fieldState.sideSize;
        if (Math.round(sideSize) !== sideSize) {
            throw Error('Not valid matrix initial state!');
        }

        $scope.$emit('pageViewed');
        $scope.navBack('levels', { initialGroup: gs.chapterId });

        var levelFinished = false;
        var vm = this;

        activate();

        function activate() {
            angular.extend(vm, gs);
            updateDbStateObject();
            vm.showGoalThroughModal = vm.levelId === '1-1';
            
            if (vm.showGoalThroughModal) {
                $timeout(function() {
                    function modalCloseCallback() {
                        vm.showGoalThroughModal = false;
                    }

                    var options = { callback: modalCloseCallback };
                    $scope.panelModal('views/game/startGameTutorial.html', $rootScope.$new(), options)
                        .show();
                }, 0);
            }
        }

        function updateDbStateObject() {
            playerData.updateGameState({
                levelId: vm.levelId,
                currentState: vm.fieldState.toStateArray(),
                movesCount: vm.movesCount
            });
        }

        function doMove(row, column, direction) {
            if (direction) {
                vm.fieldState.applyMatrixMove(row, column, direction);
                vm.movesCount++;
                updateDbStateObject();
            }
        }

        function adjustDirection(direction, posX, posY) {
            function isMoved(posX, posY) {
                return posX < vm.boundingRect.left || 
                       posX > vm.boundingRect.right ||
                       posY < vm.boundingRect.top || 
                       posY > vm.boundingRect.bottom;
            }

            return isMoved(posX, posY) ? direction : '';
        }

        vm.whenMoveStart = function(boundingRect, x, y, triggerType) {
            vm.boundingRect = triggerType === 'touch' ?
                                boundingRect :
                                { left: x - 30, right: x + 30, top: y - 30, bottom: y + 30 };
        };

        vm.whenMoved = function(row, column, direction, x, y) {
            if (levelFinished) 
                return;

            direction = adjustDirection(direction, x, y);
            vm.fieldState.invalidateAnimationClasses(row, column, direction);
        };

        vm.whenMoveEnd = function(row, column, direction, x, y) {
            if (levelFinished) 
                return;

            direction = adjustDirection(direction, x, y);
            doMove(row, column, direction);
            if (vm.validateToGoal()) {
                levelFinished = true;
                var saveResult = userLevelsData.completeLevel(vm.levelId, vm.movesCount);
                $timeout(function() {
                    saveResult.then(function(nextLevelId) {
                        var childScope = angular.extend($rootScope.$new(), {
                            stars: levelsData.getLevelStars(vm.levelData, vm.movesCount),
                            currentChapter: vm.chapterId,
                            nextLevel: nextLevelId,
                            repeatClicked: function() { vm.reloadGame(); }
                        });
                        var modal = $scope.panelModal('views/game/nextLevelModal.html', childScope).show();
                    });
                    $scope.$emit('analyticsEvent', {
                        category: 'Level Status',
                        action: 'Completed',
                        label: vm.levelId,
                        value: vm.movesCount
                    });
                }, 100);
            }
        };

        vm.reloadGame = function() {
            $scope.$emit('analyticsEvent', {
                category: 'Level Status',
                action: 'Retry',
                label: vm.levelId,
                value: vm.movesCount
            });
            if ($stateParams.skipAd || $stateParams.savedGame) {
                $state.go('game', { levelId: vm.levelId }, { reload: true, inherit: false, notify: true });
            } else {
                $state.reload();
            }
        }

        vm.randomNShifts = function() {
            var shifts = 50;
            for (var i =0; i < shifts; i++) {
                var col = Math.ceil(Math.random() * sideSize) - 1,
                    row = Math.ceil(Math.random() * sideSize) - 1,
                    direction = (['u', 'd', 'l', 'r'])[Math.ceil(Math.random() * 4 ) - 1];
                doMove(row, col, direction);
            }
            var currentState = vm.fieldState.toStateArray();
            console.log(currentState);
            console.log(currentState.map(function(el) { return el || '-'}).join(''));
        }

        var DEFAULT_CONTROLS_SIZE = 25;
        function goalContainerWidth() { return DEFAULT_CONTROLS_SIZE * sideSize * screenSettings.sizeFactor; }
        function getFieldWidth() {
            var paddingValue = Math.max(20, Math.ceil(screenSettings.mainContainerWidth / 20));
            var gameContainerWidth = screenSettings.screenWidth > 500 ? 500: screenSettings.screenWidth;
            return gameContainerWidth - (paddingValue - 2) * 2; // Minus padding
        }
        vm.gameGoalContainerStyles = function() {
            return { width: goalContainerWidth() + 'px' };
        };
        vm.goalHintOuterStyles = function() {
            return { left: goalContainerWidth() / 2 + 'px' };
        };
        vm.goalTableStyles = function() {
            return { width: goalContainerWidth() + 'px', height: goalContainerWidth() + 'px' };
        };
        vm.gameMatrixStyles = function() {
            var fieldWidth = getFieldWidth();
            return { width: fieldWidth + 'px', height: fieldWidth + 'px' };
        };
        vm.matrixCellStyles = function() {
            var sidePixels = getFieldWidth() / sideSize;
            var sideLine = (sidePixels - 4); //Minus border
            return { 
                width: sidePixels + 'px', 
                height: sidePixels + 'px', 
                'line-height': sideLine + 'px',
                'font-size': sideLine / 3 * 2 + 'px' 
            };
        };

    }

});