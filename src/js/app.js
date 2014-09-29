'use strict';

requirejs.config({
    baseUrl: 'lib/js',
    paths: {
        app: '../../js'
    },
    shim: {
        'angular' : {'exports' : 'angular'},
        'angular-touch': ['angular'],
        'angular-route': ['angular'],
        'localstorage-schema': { 'exports': 'localStorageSchema' }
    },
    //Allow dynamic reloading within the app
    urlArgs: (/cacheBust=\d+/.exec(location.href) || [])[0]
});

// Start loading the main app file. Put all of
// your application logic in there.
window.name = "NG_DEFER_BOOTSTRAP!";

function ngCName(module, controllerName) {
    return module.id.replace('app/', '') + '/' + controllerName;
}

function isPhoneGap() {
    return (window.cordova || window.PhoneGap || window.phonegap)
        && /^file:\/{3}[^\/]/i.test(window.location.href)
        && /ios|iphone|ipod|ipad|android/i.test(navigator.userAgent);
}

requirejs(['angular', 'app/main'], function(angular, main) {
    angular.element(document).ready(function() {
        angular.resumeBootstrap([main['name']]);
    });
});