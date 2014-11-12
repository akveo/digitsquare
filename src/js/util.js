'use strict';

define([], function() {
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
        }
    };
});