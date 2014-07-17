module.exports = function(grunt) {
    var templatesDirs = ['index.html', 'views/**/*.html'],
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
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-bower-task');
    grunt.loadNpmTasks('grunt-contrib-copy');


    grunt.registerTask('buildAssets', ['bower:install', 'sass:build', 'copy:templates', 'copy:scripts']);

    grunt.registerTask('src-watch',['buildAssets', 'watch']);

};