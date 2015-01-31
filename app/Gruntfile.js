module.exports = function(grunt) {
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
        copy: {
            config_prod: {
                src: 'www/js/config/config.prod.template.js',
                dest: 'www/js/config.js'
            },
            config_local: {
                src: 'www/js/config/config.local.template.js',
                dest: 'www/js/config.js'
            }
        },
        exec: {
            signAndroid: {
                command: 'cp my-release-key.keystore platforms/android/ant-build/;' +
                         'cd platforms/android/ant-build/;' + 
                         'jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore my-release-key.keystore -storepass Qazxsw123456 DigitSquare-release-unsigned.apk alias_name;' +
                         'jarsigner -verify -verbose -certs DigitSquare-release-unsigned.apk;' +
                         '$ANDROID_HOME/build-tools/android-4.4W/zipalign -f -v 4 DigitSquare-release-unsigned.apk DigitSquare-release-signed-aligned.apk;' +
                         'cd ../../..'
            },
            buildAndroid: {
                command: 'cordova build android --release'
            },
            buildIos: {
                command: 'phonegap build ios --release'
            }
        }
    });

    grunt.loadNpmTasks('grunt-sass');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-bower-task');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-exec');

    var envo = grunt.option('envo') || 'prod';
    grunt.registerTask('copyConfig', ['copy:config_' + envo]);

    grunt.registerTask('buildAssets', ['copyConfig', 'bower:install', 'sass:build']);

    grunt.registerTask('src-watch',['buildAssets', 'watch']);
    grunt.registerTask('build-android', ['buildAssets', 'exec:buildAndroid']);
    grunt.registerTask('build-ios', ['buildAssets', 'exec:buildIos']);

};