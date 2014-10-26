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
                    'target/css/style.css': 'sass/index.scss'
                }
            }
        },
        watch: {
            scss: {
                files: ['sass/**/*.scss'],
                tasks: ['sass:build']
            },
            templates: {
                files: templatesDirs,
                tasks: ['copy:templates']
            },
            scripts: {
                files: jsDirs,
                tasks: ['copy:scripts']
            },
            fonts: {
                files: fontsDir,
                tasks: ['copy:fonts']
            }

        },
        bower: {
            install: {
                options: {
                    targetDir: './target/lib',
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
            templates: {
                src: templatesDirs,
                dest: 'target/'
            },
            scripts: {
                src: 'js/**/*js',
                dest: 'target/'
            },
            fonts: {
                src: fontsDir,
                dest: 'target/'
            },
            dist: {
                expand: true,
                cwd: 'target/',
                src: '**',
                dest: '../app/www'
            }
        },
        exec: {
            buildAndroid: {
                cwd: '../app/',
                command: 'phonegap build android --release'
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-bower-task');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-exec');

    grunt.registerTask('buildAssets', ['bower:install', 'sass:build', 'copy:templates', 'copy:scripts', 'copy:fonts']);

    grunt.registerTask('src-watch',['buildAssets', 'watch']);
    grunt.registerTask('dist-src', ['buildAssets', 'copy:dist']);
    grunt.registerTask('build-android', ['dist-src', 'exec:buildAndroid']);

};