#!/usr/bin/env node

// this plugin injects cordova script in index.html
//
var fs = require('fs');
var path = require('path');

var rootdir = process.argv[2];

function replace_string_in_file(filename, to_replace, replace_with) {
    var data = fs.readFileSync(filename, 'utf8');

    var result = data.replace(new RegExp(to_replace, "g"), replace_with);
    fs.writeFileSync(filename, result, 'utf8');
}
if (rootdir) {
    var filestoreplace = [
        // android
        "platforms/android/assets/www/index.html",
        // ios
        "platforms/ios/www/index.html",
        // wp8
        "platforms/wp8/www/index.html"
    ];

    filestoreplace.forEach(function(val, index, array) {
        var fullfilename = path.join(rootdir, val);
        if (fs.existsSync(fullfilename)) {
            replace_string_in_file(fullfilename,
                '<!-- CORDOVA_SCRIPT_INJECTION_POINT -->',
                '<script type="text/javascript" src="cordova.js"></script>');
        }
    });

}