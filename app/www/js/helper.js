'use strict';

define(['angular'], function(angular) {

    var module = angular.module('helper', [])
            .service('panelModal', function($compile, $rootScope) {

                return function(tpl, scope) {
                    var element = angular.element('<div class="panel-modal-container"><include-replace src="' + tpl + '"/></div>'),
                        currentScope = scope || $rootScope.$new();

                    currentScope.closeAndNavigate = function(link, params) {
                        element.remove();
                        currentScope.goToPath(link, params);
                    };
                    currentScope.closePanel = function(cb) {
                        element.remove();
                        cb && cb();
                    };

                    angular.element(document.body).append(element);
                    $compile(element)(scope || $rootScope);

                    return {
                        show: function() {
                            element.css('display', 'block');
                        },
                        destroy: function() {
                            element.remove();
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