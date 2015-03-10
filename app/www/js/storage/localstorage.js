define(['angular', 'localstorage-schema'], function(angular, lsSchema) {
    'use strict';

    angular.module('app.storage', [])
            .constant('localStorageSchema', lsSchema)
            .factory('playerData', $PlayerData);

    $PlayerData.$inject = ['$q', 'localStorageSchema'];
    function $PlayerData($q, localStorageSchema) {
        var schema = localStorageSchema(),
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
            setLevelScore: function(levelId, scoreObj) {
                return $q(function(resolve) {
                    if (!levelsScores.get(levelId)) {
                        resolve(levelsScores.insert(scoreObj, levelId));
                    } else {
                        resolve(levelsScores.object(levelId).persist(scoreObj));
                    }
                    
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
    }
});