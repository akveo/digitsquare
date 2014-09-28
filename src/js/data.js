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
                },
                getNextLevelId: function(levelId) {
                    var wasPrevios = false;
                    for (var i = 0; i < levelsList.length; i++) {
                        var chapter = levelsList[i],
                            chapterLevels = chapter.chapterLevels;
                        for (var j = 0; j < chapterLevels.length; j++) {
                            var level = chapterLevels[j].label;
                            if (wasPrevios) {
                                return { chapterId: i, levelId: level };
                            }
                            if (level == levelId) {
                                wasPrevios = true;
                            }
                        }
                    }
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
                            isCompleted: levelScore.isCompleted,
                            score: levelScore.score || 0
                        };
                    });
                    return {
                        chapterLabel: chapter.chapterLabel,
                        chapterLevels: extendedLevels
                    };
                },
                unlockNextLevel: function(levelId) {
                    var nextLevelInfo = levelsData.getNextLevelId(levelId),
                        levelScore = playerData.getLevelScore(nextLevelInfo.levelId);

                    levelScore.enabled = true;

                    playerData.setLevelScore(nextLevelInfo.levelId, levelScore);
                    return nextLevelInfo;
                },
                completeLevel: function(chapterId, levelId, movesCount) {
                    var nextLevelInfo = this.unlockNextLevel(levelId);

                    var levelScore = playerData.getLevelScore(levelId),
                        levelData = levelsData.getLevel(chapterId, levelId);

                    levelScore.isCompleted = true;
                    if (!levelScore.movesCount || movesCount < levelScore.movesCount) {
                        levelScore.movesCount = movesCount;
                        levelScore.score = 3 - levelData.movesCountForStars.reduce(function(agg, curr, index) {
                            if (agg == -1 && curr >= movesCount) {
                                return index;
                            }
                            return agg;
                        }, -1);
                    }

                    playerData.setLevelScore(levelId, levelScore);
                    return nextLevelInfo;
                }
            };
        });
});
