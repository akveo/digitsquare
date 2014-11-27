'use strict';

define(['localstorage-schema'], function(lsSchema) {

    return function(dataModule) {
        dataModule.factory('playerData', function($q) {
            var schema = lsSchema(),
                gameState = schema.object('gameState'),
                levelsScores = schema.collection('levelsScores');
            return {
                getGameState: function() {
                    return $q(function(resolve) {
                        resolve(gameState.read());
                    });
                },
                updateGameState: function(stateObject) {
                    return $q(function(resolve) {
                        resolve(gameState.persist(stateObject));
                    });
                },
                moveToLevel: function(levelId) {
                    return this.getGameState().then(function(state) {
                        state.level = levelId;
                        return this.updateGameState(state);
                    }.bind(this));
                },
                updateCurrentLevelCubeState: function(cubeState) {
                    return this.getGameState().then(function(state) {
                        state.cubeState = cubeState;
                        return this.updateGameState(state);
                    }.bind(this));
                },
                setLevelScore: function(levelId, scoreObj) {
                    return $q(function(resolve) {
                        resolve(levelsScores.object(levelId).persist(scoreObj));
                    });
                },
                getLevelScore: function(levelId) {
                    return $q(function(resolve) {
                        resolve(levelsScores.get(levelId) || {});
                    });
                },
                getFullLevelScores: function() {
                    return $q(function(resolve) {
                        var scoresLevels = levelsScores.keys(),
                            res = {};
                        scoresLevels.forEach(function(key) {
                            res[key] = levelsScores.get(key);
                        });
                        resolve(res);
                    });
                }
            };
        });
    };
});