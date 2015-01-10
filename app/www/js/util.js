'use strict';

define(['angular'], function(angular) {
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
        }
    };
});