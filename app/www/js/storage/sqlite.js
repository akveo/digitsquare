'use strict';

define(['app/config'], function(config) {

    var db;
    function checkDatabase() {
        function _doInit() {
            db = window.sqlitePlugin.openDatabase({ name: config.db.name });
            db.transaction(function(tx) {
                tx.executeSql('CREATE TABLE IF NOT EXISTS game_state (id integer primary key, data text)');
                tx.executeSql('CREATE TABLE IF NOT EXISTS levels_data (id text primary key, data text)');
            }, function(e) {
                console.log("ERROR: " + e.message);
            }); 
        }

        // window.sqlitePlugin.deleteDatabase(config.db.name, _doInit);
        _doInit();
    }
    if (!window.sqlitePlugin) {
        document.addEventListener("deviceready", checkDatabase, false);
    } else {
        checkDatabase();
    }

    return function(dataModule) {
        dataModule.factory('playerData', function($q) {

            var levelsScoresCache = null;

            function _clone(obj) {
                return JSON.parse(JSON.stringify(obj));
            }

            function transactionPromise(cb) {
                
                var result = null;
                function valueResolver(value) {
                    result = value;
                }

                return $q(function(resolve, reject) {
                    db.transaction(function(tx) {
                        cb(tx, valueResolver);
                    }, function(err) {
                        reject(err);
                    }, function() {
                        resolve(result);
                    });
                });
            }

            var API = {
                getGameState: function() {
                    return transactionPromise(function(tx, resolve) {
                        tx.executeSql("SELECT data FROM game_state WHERE id=?", [1], function(tx,res) {
                            resolve(res.rows.length ? JSON.parse(res.rows.item(0).data) : null);
                        });  
                    });
                },
                updateGameState: function(stateObject) {
                    return transactionPromise(function(tx, resolve) {
                        tx.executeSql("SELECT data FROM game_state WHERE id=?", [1], function(tx, res) {
                            function cb() {
                                resolve(stateObject);
                            }

                            if (!res.rows.length) {
                                tx.executeSql('INSERT INTO game_state (id, data) VALUES (?,?)', [1, JSON.stringify(stateObject)], cb);
                            } else {
                                tx.executeSql('UPDATE game_state SET data=? WHERE id=?', [JSON.stringify(stateObject), 1], cb);
                            }
                        });
                    });
                },
                setLevelScore: function(levelId, scoreObj) {
                    levelsScoresCache[levelId] = _clone(scoreObj);
                    return transactionPromise(function(tx, resolve) {
                        tx.executeSql("SELECT data FROM levels_data WHERE id=?", [levelId], function(tx, res) {
                            function cb() {
                                resolve(scoreObj);
                            }
                            if (res.rows.length) {
                                tx.executeSql("UPDATE levels_data SET data=? WHERE id=?", [JSON.stringify(scoreObj), levelId], cb);
                            } else {
                                tx.executeSql('INSERT INTO levels_data (id, data) VALUES (?,?)', [levelId, JSON.stringify(scoreObj)], cb);
                            }
                        });
                    });
                },
                getLevelScore: function(levelId) {
                    function _doGetScore() {
                        if (levelsScoresCache) {
                            return _clone(levelsScoresCache[levelId] || {});
                        } else {
                            return transactionPromise(function(tx, resolve) {
                                tx.executeSql("SELECT data FROM levels_data WHERE id=?", [levelId], function(tx, res) {
                                    resolve(res.rows.length ? JSON.parse(res.rows.item(0).data) : {});
                                });
                            });
                        }
                    }
                    return $q.when(_doGetScore());
                },
                getFullLevelScores: function() {

                    function _doGetLevelScores() {
                        if (levelsScoresCache) {
                            return _clone(levelsScoresCache);
                        } else {
                            return transactionPromise(function(tx, resolve) {
                                tx.executeSql("SELECT * FROM levels_data", [], function(tx, res) {
                                    var result = {};
                                    for(var i = 0; i < res.rows.length; i++) {
                                        var item = res.rows.item(i);
                                        result[item.id] = JSON.parse(item.data);
                                    }
                                    levelsScoresCache = result;
                                    resolve(result);
                                });
                            });
                        }    
                    }

                    return $q.when(_doGetLevelScores());
                    
                }
            };
            API.getFullLevelScores();
            return API;
        });
    };
});