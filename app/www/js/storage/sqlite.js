define(['app/config', 'app/util'], function() {
    'use strict';

    angular.module('app.storage', ['app.config', 'app.util'])
        .factory('playerData', PlayerData)
        .provider('sqliteDb', SqliteDbProvider);

    $SqliteDbProvider.$inject = ['$document', 'appConfig'];
    function SqliteDbProvider($document, config) {
        var dbDeferreds = [];
        var db;
        $document.on('deviceready', checkDatabase);
        function checkDatabase() {
            function _doInit() {
                db = window.sqlitePlugin.openDatabase({ name: config.db.name });
                db.transaction(function(tx) {
                    tx.executeSql('CREATE TABLE IF NOT EXISTS game_state (id integer primary key, data text)');
                    tx.executeSql('CREATE TABLE IF NOT EXISTS levels_data (id text primary key, data text)');
                }, function(e) {
                    console.log("ERROR: " + e.message);
                }); 
                dbDeferreds.forEach(function(def) { def.resolve(db); });
            }

            // window.sqlitePlugin.deleteDatabase(config.db.name, _doInit);
            _doInit();
        }


        this.$get = SqliteDb;
        SqliteDb.$inject = ['$q'];
        function SqliteDb($q) {
            return {
                connection: function() {
                    if (db) {
                        return $q.when(db);
                    } else {
                        var def = $q.defer();
                        dbDeferreds.push(def);
                        return def.promise;
                    }
                },
                transactionalPromise: function(cb) {
                    var result = null;
                    function valueResolver(value) {
                        result = value;
                    }

                    return $q(function(resolve, reject) {
                        this.connection().then(function(db) {
                            db.transaction(function(tx) {
                                cb(tx, valueResolver);
                            }, function(err) {
                                reject(err);
                            }, function() {
                                resolve(result);
                            });
                        });
                    }.bind(this));
                }
            };
        }
    }

    PlayerData.$inject = ['$q', 'util', 'sqliteDb'];
    function PlayerData($q, u, sqliteDb) {
        var levelsScoresCache = null;

        var API = {
            getGameState: function() {
                return sqliteDb.transactionalPromise(function(tx, resolve) {
                    tx.executeSql("SELECT data FROM game_state WHERE id=?", [1], function(tx,res) {
                        resolve(res.rows.length ? JSON.parse(res.rows.item(0).data) : null);
                    });  
                });
            },
            updateGameState: function(stateObject) {
                return sqliteDb.transactionalPromise(function(tx, resolve) {
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
                levelsScoresCache[levelId] = u.clone(scoreObj);
                return sqliteDb.transactionalPromise(function(tx, resolve) {
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
                        return u.clone(levelsScoresCache[levelId] || {});
                    } else {
                        return sqliteDb.transactionalPromise(function(tx, resolve) {
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
                        return u.clone(levelsScoresCache);
                    } else {
                        return sqliteDb.transactionalPromise(function(tx, resolve) {
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
    }
});