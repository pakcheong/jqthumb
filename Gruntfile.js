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
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('test', ['jshint', 'concat', 'uglify']);
    grunt.registerTask('default', ['jshint', 'concat', 'uglify']);

};