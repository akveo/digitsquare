'use strict';

define(['app/config'], function(config) {

    var db;
    function checkDatabase() {
        var db = window.sqlitePlugin.openDatabase({ name: config.db.name });
        db.transaction(function(tx) {
            tx.executeSql('CREATE TABLE IF NOT EXISTS game_state (id integer primary key, data text)');
            tx.executeSql('CREATE TABLE IF NOT EXISTS levels_data (id text primary key, data text)');
        }, function(e) {
            console.log("ERROR: " + e.message);
        });
    }
    if (!window.sqlitePlugin) {
        document.addEventListener("deviceready", checkDatabase, false);
    } else {
        checkDatabase();
    }

    return function(dataModule) {
        dataModule.factory('playerData', function($q) {
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
                    return levelsScores.object(levelId).persist(scoreObj);
                },
                getLevelScore: function(levelId) {
                    return levelsScores.get(levelId) || {};
                },
                getScoresForLevels: function(levelsIdsArray) {
                    var scoresLevels = levelsScores.keys();
                    return levelsIdsArray.filter(function(id) { return scoresLevels.indexOf(id) != -1; }).map(function(id) { return levelsScores.get(id); })
                }
            };
        });
    };
});