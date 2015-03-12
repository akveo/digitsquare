define(['angular'], function(angular) {
    'use strict';

    angular.module('app.util', [])
        .factory('util', $AppUtil)
        .factory('exitApp', exitApp)
        .factory('screenSettings', screenSettings)
        .factory('styleBuilder', styleBuilder)
        .filter('range', $RangeFilter)
        .directive('addASpaceBetween', AddSpaceBetween);

    function $AppUtil() {
        return {
            deepExtend: function deepExtend(dst) {
                angular.forEach(arguments, function(obj) {
                    if (obj !== dst) {
                        angular.forEach(obj, function(value, key) {
                            if (dst[key] && dst[key].constructor && dst[key].constructor === Object) {
                                deepExtend(dst[key], value);
                            } else {
                                dst[key] = value;
                            }     
                        });   
                    }
                });
                return dst;
            },
            getConfigSettingForPlatform: function(obj) {
                if( /(android)/i.test(navigator.userAgent) ) {
                    return obj.android;
                } else if(/(iphone|ipad)/i.test(navigator.userAgent)) {
                    return obj.ios;
                } else if (/(iemobile)/i.test(navigator.userAgent)) {
                    return obj.wp8;
                } else {
                    return obj.desktop;
                }
                return '';
            },
            getStubFunctionsObject: function(names) {
                var rv = {};
                names.forEach(function(name) {
                    rv[name] = function() {};
                });
                return rv;
            },
            clone: function(obj) {
                return JSON.parse(JSON.stringify(obj));
            }
        };
    }

    function exitApp($window) {
        return function() {
            $window.navigator.app.exit();
        };
    }

    screenSettings.$inject = ['$rootScope', '$document', '$window'];
    function screenSettings($rootScope, $document, $window) {
        var sWidth = $document[0].documentElement.clientWidth || $window.screen.width;
        var mainContainerWidth = sWidth > 768 ? 768 : sWidth;
        var sHeight = $document[0].documentElement.clientHeight || screen.height;
        var sizeFactor = sHeight <= 480 ? 0.9 : (sWidth >= 500 ? 1.5 : 1);

        return {
            screenWidth: sWidth,
            screenHeight: sHeight,
            mainContainerWidth: mainContainerWidth,
            sizeFactor: sizeFactor
        };
    }

    function styleBuilder() {

        function _builder(initialStyle, clearInitial) {
            if (initialStyle && clearInitial) {
                Object.keys(initialStyle).forEach(function(key) {
                    delete initialStyle[key];
                });
            }

            initialStyle = initialStyle || {};
            this._result = initialStyle;
        }

        _builder.prototype.style = function(styleName, value) {
            this._result[styleName] = value;
            return this;
        };

        _builder.prototype.translate3dX = function(value) {
            value = ('' + value).indexOf('px') == -1 ? value + 'px' : value;
            var styleVal = 'translate3d(' + value + ', 0, 0)';
            this._result['-webkit-transform'] = styleVal;
            this._result['transform'] = styleVal;
            return this;
        };


        _builder.prototype.build = function() {
            return this._result;
        };

        return function(initialStyle, clearInitial) {
            return new _builder(initialStyle, clearInitial);
        };
    }

    function $RangeFilter() {
        return function(input, total) {
            total = parseInt(total);
            for (var i=0; i<total; i++)
              input.push(i);
            return input;
        };
    }

    function AddSpaceBetween() {
        return function (scope, element) {
            if(!scope.$last){
                element.after('&nbsp;');
            }
        };
    }
});