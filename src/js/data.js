'use strict';

define([ 'localstorage-schema', 'angular', 'app/levelsList' ], function(lsSchema, angular, levelsList) {
    angular.module('digitsData', [])
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
                    return levelsScores.insert(scoreObj, levelId);
                },
                getLevelScore: function(levelId) {
                    return levelsScores.get(levelId);
                },
                getScoresForLevels: function(levelsIdsArray) {
                    var scoresLevels = levelsScores.keys();
                    return levelsIdsArray.filter(function(id) { return scoresLevels.indexOf(id) != -1; }).map(function(id) { return levelsScores.get(id); })
                }
            };
        })
        .factory('levelsData', function() {
            var levelsDao = {};
            return {
                getFullList: function() {
                    return levelsList;
                },
                getReducedChapters: function() {
                    return levelsList.map(function(chapter) { return chapter.chapterLabel; });
                },
                getChapter: function(index) {
                    return levelsList[index];
                },
                getLevel: function(chapterId, levelId) {
                    return this.getChapter(chapterId).chapterLevels.filter(function(level) { return level.label == levelId; })[0];
                }
            };
        }).factory('combinedData', function(playerData, levelsData) {
            return {
                getChapterExtendedWithUserData: function(chapterId) {
                    var chapter = levelsData.getChapter(chapterId);
                    var extendedLevels = chapter.chapterLevels.map(function(level) {
                        var levelScore = playerData.getLevelScore(level.label);
                        return {
                            label: level.label,
                            enabled: level.preEnabled || (levelScore && levelScore.enabled),
                            isCompleted: levelScore && levelScore.isCompleted,
                            score: levelScore && levelScore.starsNum || 0
                        };
                    });
                    return {
                        chapterLabel: chapter.chapterLabel,
                        chapterLevels: extendedLevels
                    };
                }
            };
        });
});
