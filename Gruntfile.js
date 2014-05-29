module.exports = function(grunt) {
    var global = {
        banner : '/*!'+
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
                '*/\n'
    };

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            options: {
                separator: ';',
                stripBanners: false,
                banner: global.banner
            },
            dist: {
                src: ['<%= pkg.src %><%= pkg.filename %>.js'],
                dest: '<%= pkg.dist %><%= pkg.filename %>.js'
            }
        },
        uglify: {
            options: {
                banner: global.banner
            },
            dist: {
                files: {
                    '<%= pkg.dist %><%= pkg.filename %>.min.js': ['<%= pkg.src %><%= pkg.filename %>.js']
                }
            }
        },
        jshint: {
            files: ['Gruntfile.js', '<%= pkg.src %><%= pkg.filename %>.js'],
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
                    cwd: '<%= pkg.src %>',
                    src: ['demo.html', 'jquery-1.3.min.js', 'picture.jpg'],
                    dest: '<%= pkg.dist %>'
                }]
            }
        },
        'screenshot-element': {
            demo: {
                options: {
                    timeout: 10000
                },
                images: [
                    {
                        url: '<%= pkg.dist %>demo.html',
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
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-screenshot-element');

    grunt.registerTask('default', ['jshint', 'concat', 'uglify', 'copy', 'screenshot-element']);
};