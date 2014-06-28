module.exports = function(grunt) {

    var pkg = grunt.file.readJSON('package.json');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        meta: {
            banner: '/*!'+
                        '\n    <%= pkg.name %> V<%= pkg.version %>' +
                        '\n    Copyright (c) 2013-<%= grunt.template.today("yyyy") %>' +
                        '\n    Dual licensed under the MIT and GPL licenses.' +
                        '\n' +
                        '\n    Author       : <%= pkg.author %>' +
                        '\n    Version      : <%= pkg.version %>' +
                        '\n    Repo         : <%= pkg.repo %>' +
                        '\n    Demo         : <%= pkg.demo %>' +
                        '\n    Last Updated : <%= grunt.template.today("dddd, mmmm dS, yyyy, h:MM:ss TT") %>' +
                        '\n    Requirements : jQuery >=v1.3.0 or Zepto (with zepto-data plugin) >=v1.0.0' +
                        '\n' +
                    '*/\n'
        },
        global: {
            src         : 'src/',
            dist        : {
                root   : 'dist/',
                vendor : 'vendor/'
            }
        },
        concat: {
            options: {
                separator: ';',
                stripBanners: false,
                banner: '<%= meta.banner %>'
            },
            dist: {
                src: ['<%= global.src %><%= pkg.filename %>.js'],
                dest: '<%= global.dist.root %><%= pkg.filename %>.js'
            }
        },
        uglify: {
            options: {
                banner: '<%= meta.banner %>'
            },
            dist: {
                files: {
                    '<%= global.dist.root %><%= pkg.filename %>.min.js': ['<%= global.src %><%= pkg.filename %>.js']
                }
            }
        },
        jshint: {
            files: ['Gruntfile.js', '<%= global.src %><%= pkg.filename %>.js'],
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
                files: [
                    {
                        expand: true,
                        cwd: '<%= global.src %>',
                        src: ['picture.jpg'],
                        dest: '<%= global.dist.root %>'
                    },
                    {
                        expand: true,
                        cwd: 'bower_components/jquery',
                        src: ['jquery.js'],
                        dest: '<%= global.dist.root %><%= global.dist.vendor %>'
                    },
                    {
                        expand: true,
                        cwd: 'bower_components/zepto',
                        src: ['zepto.js'],
                        dest: '<%= global.dist.root %><%= global.dist.vendor %>'
                    },
                    {
                        expand: true,
                        cwd: 'bower_components/zepto-data',
                        src: ['zepto.data.js'],
                        dest: '<%= global.dist.root %><%= global.dist.vendor %>'
                    }
                ]
            }
        },
        replace: {
            jquery: {
                src: '<%= global.src %>demo.jquery.html',
                dest: '<%= global.dist.root %>demo.jquery.html',
                replacements: [
                    {
                        from: '../bower_components/jquery/jquery.js',
                        to: '<%= global.dist.vendor %>jquery.js'
                    }
                ]
            },
            zepto: {
                src: '<%= global.src %>demo.zepto.html',
                dest: '<%= global.dist.root %>demo.zepto.html',
                replacements: [
                    {
                        from: '../bower_components/zepto/zepto.js',
                        to: '<%= global.dist.vendor %>zepto.js'
                    },
                    {
                        from: '../bower_components/zepto-data/zepto.data.js',
                        to: '<%= global.dist.vendor %>zepto.data.js'
                    }
                ]
            }
        },
        'screenshot-element': {
            demo: {
                options: {
                    timeout: 2000 /* wait for animation to be done */
                },
                images: [
                    {
                        url: '<%= global.dist.root %>demo.jquery.html',
                        file: 'screenshots/screenshot.jquery.png',
                        selector: 'body'
                    },
                    {
                        url: '<%= global.dist.root %>demo.zepto.html',
                        file: 'screenshots/screenshot.zepto.png',
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
    grunt.loadNpmTasks('grunt-text-replace');
    grunt.loadNpmTasks('grunt-screenshot-element');
    
    grunt.registerTask('readme', '', function () {
        var readMeFile = 'README.md',
            data = grunt.file.read(readMeFile);

        var lineArr = data.toString().split('\n'),
                newStr  = '';

        for(var i=0; i<lineArr.length-1; i++){
            if(i === 0){
                newStr += pkg.name + ' V' + pkg.version + '\n';
            }else{
                newStr += lineArr[i] + '\n';
            }
        }

        grunt.file.write(readMeFile, newStr);
    });

    grunt.registerTask('dev', ['jshint', 'concat', 'uglify', 'copy', 'replace']);
    grunt.registerTask('default', ['jshint', 'concat', 'uglify', 'copy', 'replace', 'readme', 'screenshot-element']);
};