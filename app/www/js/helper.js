'use strict';

define(['angular'], function(angular) {

    var module = angular.module('helper', [])
            .service('panelModal', function($compile, $rootScope) {

                return function(tpl, scope, options) {
                    var element = angular.element('<div class="panel-modal-container"><include-replace src="' + tpl + '"/></div>'),
                        currentScope = scope || $rootScope.$new();

                    options = options || {};
                    var optCallback = options.callback;
                    var cssClass = options.cssClass;

                    if (cssClass) {
                        element.addClass(cssClass);
                    }

                    function doDestroy() {
                        element.remove();
                        currentScope.$destroy();
                        optCallback && optCallback();
                    }

                    currentScope.closeAndNavigate = function(link, params) {
                        doDestroy();
                        currentScope.goToPath(link, params);
                    };
                    currentScope.closePanel = function(cb) {
                        doDestroy();
                        cb && cb();
                    };

                    angular.element(document.body).append(element);
                    $compile(element)(scope || $rootScope);

                    return {
                        show: function() {
                            element.css('display', 'block');
                        },
                        destroy: function() {
                            doDestroy();
                        },
                        isDestroyed: function() {
                            return !!element.parentNode;
                        }
                    };
                };
            })
            .directive('includeReplace', function($templateCache, $compile, $http) {
                return {
                    restrict: 'E',
                    link: function(scope, element, attrs) {
                        $http.get(attrs.src, { cache: $templateCache })
                            .success(function(templateContent) {
                                element.replaceWith($compile(templateContent)(scope));                
                            });    
                    }
                };
            });

});