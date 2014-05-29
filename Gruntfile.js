module.exports = function(grunt) {
    var banner = '/*!'+
            '\n    jQThumb <%= pkg.version %>' +
            '\n    Copyright (c) 2013-<%= grunt.template.today("yyyy") %>' +
            '\n    Dual licensed under the MIT and GPL licenses.' +
            '\n' +
            '\n    Author       : <%= pkg.author %>' +
            '\n    Version      : <%= pkg.version %>' +
            '\n    Repo         : <%= pkg.repo %>' +
            '\n    Demo         : <%= pkg.demo %>' +
            '\n    Last Updated : <%= grunt.template.today("dddd, mmmm dS, yyyy, h:MM:ss TT") %>' +
            '\n    Requirements : jQuery v1.3 or later' +
            '\n' +
            '*/\n';

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            options: {
                separator: ';',
                stripBanners: false,
                banner: banner
            },
            dist: {
                src: ['demo/<%= pkg.filename %>.js'],
                dest: 'dist/<%= pkg.filename %>.js'
            }
        },
        uglify: {
            options: {
                banner: banner
            },
            dist: {
                files: {
                    'dist/<%= pkg.filename %>.min.js': ['demo/<%= pkg.filename %>.js']
                }
            }
        },
        jshint: {
            files: ['Gruntfile.js', 'demo/jquery.thumb.js'],
            options: {
                // options here to override JSHint defaults
                globals: {
                    jQuery: true,
                    console: true,
                    module: true,
                    document: true
                }
            }
        },
        copy: {
            main: {
                files: [{
                    expand: true,
                    cwd: 'demo',
                    src: ['demo.html', 'jquery-1.3.min.js', 'picture.jpg'],
                    dest: 'dist'
                }]
            }
        },
        'screenshot-element': {
            chart: {
                options: {
                    timeout: 10000
                },
                images: [
                    {
                        url: 'demo/demo.html',
                        file: 'screenshot.png',
                        selector: 'body'
                    }
                ]
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-screenshot-element');
    grunt.loadNpmTasks('grunt-contrib-copy');
    
    grunt.registerTask('default', ['jshint', 'concat', 'uglify', 'copy', 'screenshot-element']);
};