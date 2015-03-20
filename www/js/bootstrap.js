'use strict';

requirejs.config({
    baseUrl: 'lib/js',
    paths: {
        app: '../../js'
    },
    shim: {
        'angular' : { exports : 'angular' },
        'angular-touch': ['angular'],
        'angular-swipe-element': ['angular'],
        'angular-ui-router': ['angular'],
        'localstorage-schema': { 'exports': 'localStorageSchema' },
        'app/lib/ga': { 'exports': '_gaq'}
    },
    //Allow dynamic reloading within the app
    urlArgs: (/cacheBust=\d+/.exec(location.href) || [])[0]
});

function isPhoneGap() {
    return (window.cordova || window.PhoneGap || window.phonegap)
        && /^file:\/{3}[^\/]/i.test(window.location.href)
        && /ios|iphone|ipod|ipad|android/i.test(navigator.userAgent);
}

requirejs(['angular', 'app/app'], function(angular) {
    angular.element(document).ready(function() {
        angular.bootstrap(document, ['app']);
    });
});