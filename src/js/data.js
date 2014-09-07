'use strict';

define([ 'localstorage-schema', 'angular' ], function(lsSchema, angular) {
    angular.module('data', [])
        .factory('playerData', function() {
            var schema = lsSchema(),
                gameState = schema.object('gameState'),
                levelsScores = schema.collection('levelsScores');
            return {
                getGameState: function() {
                    return gameState.read();
                },
                updateGameState: function(stateObject) {
                    return gameState.persist(stateObject);
                },
                moveToLevel: function(levelId) {
                    var state = this.getGameState();
                    state.level = levelId;
                    return this.updateGameState(state);
                },
                updateCurrentLevelCubeState: function(cubeState) {
                    var state = this.getGameState();
                    state.cubeState = cubeState;
                    return this.updateGameState(state);
                },
                setLevelScore: function(levelId, scoreObj) {
                    return collection.insert(scoreObj, levelId);
                },
                getScoresForLevels: function(levelsIdsArray) {
                    var scoresLevels = levelsScores.keys();
                    return levelsIdsArray.filter(function(id) { return scoresLevels.indexOf(id) != -1; }).map(function(id) { return levelsScores.get(id); })
                }
            };
        })
        .factory('levelsData', function() {
            var levelsDao = {};
            return {};
        });
});
