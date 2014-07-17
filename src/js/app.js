requirejs.config({
    baseUrl: 'lib/js',
    paths: {
        app: '../../../js'
    },
    //Allow dynamic reloading within the app
    urlArgs: (/cacheBust=\d+/.exec(location.href) || [])[0]
});

// Start loading the main app file. Put all of
// your application logic in there.
requirejs(['app/main']);