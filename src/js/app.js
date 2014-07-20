'use strict';

requirejs.config({
    baseUrl: 'lib/js',
    paths: {
        app: '../../../js'
    },
    shim: {
        'angular' : {'exports' : 'angular'},
        'angular-touch': ['angular'],
        'angular-route': ['angular']
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

requirejs(['angular', 'app/main'], function(angular, main) {
    angular.element(document).ready(function() {
        angular.resumeBootstrap([main['name']]);
    });
});