define(['angular'], function(angular) {
    'use strict';

    angular.module('app.util', [])
        .factory('util', $AppUtil)
        .factory('exitApp', exitApp)
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