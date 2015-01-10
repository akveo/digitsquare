'use strict';

define(['angular'], function(angular) {
    var services = angular.module('routeResolverServices', []);

    services.provider('routeResolver', function() {
        
        this.$get = function() {
            return this;
        }

        this.routeConfig = function() {
            var viewsDirectory = 'views/',
                controllersDirectory = 'app/';

            return {
                setBaseDirectories: function(viewsDir, controllersDir) {
                    viewsDirectory = viewsDir;
                    controllersDirectory = controllersDir;
                },

                getViewsDirectory: function() {
                    return viewsDirectory;
                },

                getControllersDirectory: function() {
                    return controllersDirectory;
                }    
            }
        }();

        this.route = function(routeConfig) {
            var resolveDependencies = function($q, $rootScope, dependencies) {
                var defer = $q.defer();
                require(dependencies, function() {
                    defer.resolve();
                    $rootScope.$apply();
                });
                return defer.promise;
            }
            return {
                resolve: function(baseName, tplBaseName) {
                    var routeDef = {};
                    routeDef.templateUrl = routeConfig.getViewsDirectory() + (tplBaseName || baseName) + '.html';
                    routeDef.controller = baseName + 'Controller';
                    routeDef.resolve = {
                        load: ['$q', '$rootScope', function($q, $rootScope) {
                            var baseNameParts = baseName.split('/');
                            baseNameParts.pop();
                            var dependencies = [routeConfig.getControllersDirectory() + baseNameParts.join('/')];
                            return resolveDependencies($q, $rootScope, dependencies);
                        }]
                    };
                    return routeDef;
                }
            }
        }(this.routeConfig);
    })
});