'use strict';

requirejs.config({
    baseUrl: 'lib/js',
    paths: {
        app: '../../js',
        cordova: '../../cordova'
    },
    shim: {
        'angular' : {
            exports : 'angular',
            deps: isPhoneGap() ? ['cordova'] : [] // To prevent error on desktop version
        },
        'angular-touch': ['angular'],
        'angular-swipe-element': ['angular'],
        'angular-ui-router': ['angular'],
        'localstorage-schema': { 'exports': 'localStorageSchema' },
        'app/lib/ga': { 'exports': '_gaq'}
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

requirejs(['angular', 'app/app'], function(angular) {
    angular.element(document).ready(function() {
        angular.resumeBootstrap(['app']);
    });
});