module.exports = function(grunt) {

    function deepExtend(dst) {
        var args = [].slice.call(arguments);
        args.forEach(function(obj) {
            if (obj !== dst) {
                for (var key in obj) {
                    var value = obj[key];
                    if (dst[key] && dst[key].constructor && dst[key].constructor === Object) {
                        deepExtend(dst[key], value);
                    } else {
                        dst[key] = value;
                    }
                }
            }
        });
        return dst;
    }

    function extendConfigs() {
        var configs = [].slice.call(arguments).map(function(name) {
            return grunt.file.readJSON('config/config.' + name + '.json');
        });
        return deepExtend.apply(null, configs);
    }

    var templatesDirs = ['index.html', 'views/**/*.html'],
        fontsDir = ['fonts/*'],
        jsDirs = 'js/**/*js';

  // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        sass: {
            build: {
                files: {
                    'www/css/style.css': 'sass/index.scss'
                }
            }
        },
        watch: {
            scss: {
                files: ['sass/**/*.scss'],
                tasks: ['sass:build']
            }
        },
        bower: {
            install: {
                options: {
                    targetDir: './www/lib',
                    layout: function(type, pkg) { return type; },
                    install: true,
                    verbose: false,
                    cleanTargetDir: true,
                    cleanBowerDir: false,
                    bowerOptions: {}
                }
            }
        },
        exec: {
            signAndroid: {
                command: 'cp my-release-key.keystore platforms/android/ant-build/;' +
                         'cd platforms/android/ant-build/;' + 
                         'jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore my-release-key.keystore -storepass 123456 -keypass 123456 MainActivity-release-unsigned.apk alias_name;' +
                         'jarsigner -verify -verbose -certs MainActivity-release-unsigned.apk;' +
                         '$ANDROID_HOME/build-tools/android-4.4W/zipalign -f -v 4 MainActivity-release-unsigned.apk MainActivity-release-signed-aligned.apk;' +
                         'cd ../../..'
            },
            buildAndroid: {
                command: 'cordova build android --release'
            },
            buildIos: {
                command: 'phonegap build ios --release'
            }
        },
        ngconstant: {
            options: {
                dest: 'www/js/config.js',
                name: 'app.config',

                wrap: '\'use strict\';\n' +
                      '\n' +
                      'define(["angular"], function(angular) {\n' +
                      '    return {%= __ngModule %}\n' +
                      '\n});'
            },
            dev: {
                constants: {
                    'appConfig': extendConfigs('base', 'dev')
                }
            },
            prod: {
                constants: {
                    'appConfig': extendConfigs('base', 'prod')
                }
            }
            
        }
    });

    grunt.loadNpmTasks('grunt-sass');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-bower-task');
    grunt.loadNpmTasks('grunt-exec');
    grunt.loadNpmTasks('grunt-ng-constant');

    var envo = grunt.option('envo') || 'dev';
    grunt.registerTask('copyConfig', ['ngconstant:' + envo]);

    grunt.registerTask('buildAssets', ['copyConfig', 'bower:install', 'sass:build']);

    grunt.registerTask('src-watch',['buildAssets', 'watch']);
    grunt.registerTask('build-android', ['buildAssets', 'exec:buildAndroid']);
    grunt.registerTask('build-ios', ['buildAssets', 'exec:buildIos']);

};