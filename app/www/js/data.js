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

            function _clone(obj) {
                return JSON.parse(JSON.stringify(obj));
            }

            return {
                getChapters: function() {
                    return levelsList.chapters;
                },
                getChaperIds: function() {
                    return Object.keys(this.getChapters());
                },
                getChaptersArray: function() {
                    return Object.keys(this.getChapters()).map(function(chapterId) { 
                        return this.getChapter(chapterId);
                    }, this);
                },
                getNextChapter: function(chapterId) {
                    return this.getChapter('' + (parseInt(chapterId) + 1));
                },
                getChapter: function(chapterId) {
                    return this.getChapters()[chapterId];
                },                
                getFullChapter: function(chapterId) {
                    var chapter = _clone(this.getChapter(chapterId));
                    chapter.levels = chapter.levels.map(function(levelId) {
                        return {
                            id: levelId, 
                            data: this.getLevel(levelId)
                        };
                    }, this);
                    return chapter;
                },
                getLevel: function(levelId) {
                    return levelsList.levels[levelId];
                },
                getLevelStars: function(levelData, moves) {
                    return 3 - levelData.movesCountForStars.reduce(function(agg, curr, index) {
                        if (agg == 3 && curr >= moves) {
                            return index;
                        }
                        return agg;
                    }, 3);
                },
                getNextLevelId: function(levelId) {
                    var wasPrevios = false;
                    var splittedLevel = levelId.split('-'),
                        chapter = this.getChapter(splittedLevel[0]),
                        nextLevel = chapter.levels[chapter.levels.indexOf(levelId) + 1];

                    if (!nextLevel) {
                        var nextChapter = this.getNextChapter(chapterId);
                        nextLevel = nextChapter && nextChapter.levels[0];
                    }

                    return nextLevel;
                },
                getInitialLevelDataForLevel: function(levelId) {
                    var level = this.getLevel(levelId);
                    return { 
                        levelId: levelId,
                        currentState: level.initial,
                        movesCount: 0
                    };
                }
            };
        }).factory('combinedData', function(playerData, levelsData) {
            return {
                getChapterExtendedWithUserData: function(chapterId) {
                    var chapter = levelsData.getChapter(chapterId);
                    var extendedLevels = levelsData.getFullChapter(chapterId).levels.map(function(level) {
                        var levelScore = playerData.getLevelScore(level.id);
                        return {
                            id: level.id,
                            label: level.data.label,
                            enabled: level.data.preEnabled || (levelScore && levelScore.enabled),
                            isCompleted: levelScore.isCompleted,
                            score: levelScore.score || 0
                        };
                    });
                    return {
                        id: chapterId,
                        chapterLabel: chapter.label,
                        chapterLevels: extendedLevels
                    };
                },
                getChaptersExtendedWithUserData: function() {
                    return levelsData.getChaperIds().map(this.getChapterExtendedWithUserData.bind(this));
                },
                unlockNextLevel: function(levelId) {
                    var nextLevelId = levelsData.getNextLevelId(levelId),
                        levelScore = playerData.getLevelScore(nextLevelId);

                    levelScore.enabled = true;

                    playerData.setLevelScore(nextLevelId, levelScore);
                    return nextLevelId;
                },
                completeLevel: function(levelId, movesCount) {
                    var nextLevelId = this.unlockNextLevel(levelId);
                    playerData.updateGameState(levelsData.getInitialLevelDataForLevel(nextLevelId));

                    var levelScore = playerData.getLevelScore(levelId),
                        levelData = levelsData.getLevel(levelId);

                    levelScore.isCompleted = true;
                    if (!levelScore.movesCount || movesCount < levelScore.movesCount) {
                        levelScore.movesCount = movesCount;
                        levelScore.score = levelsData.getLevelStars(levelData, movesCount);
                    }

                    playerData.setLevelScore(levelId, levelScore);
                    return nextLevelId;
                }
            };
        });
});
