module.exports = function(grunt) {

    var pkg = grunt.file.readJSON('package.json');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        meta: {
            banner: '/*!'+
                        '\n    <%= pkg.name %> v<%= pkg.version %>' +
                        '\n    Copyright (c) 2013-<%= grunt.template.today("yyyy") %>' +
                        '\n    Released under the MIT license.' +
                        '\n' +
                        '\n    Author       : <%= pkg.author %>' +
                        '\n    Version      : <%= pkg.version %>' +
                        '\n    Repo         : <%= pkg.repository.url %>' +
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
                        expand : true,
                        cwd    : '<%= global.src %>',
                        src    : ['style.css', 'main.js', 'picture.jpg'],
                        dest   : '<%= global.dist.root %>'
                    },
                    {
                        expand : true,
                        cwd    : 'bower_components/jquery',
                        src    : ['jquery.js'],
                        dest   : '<%= global.dist.root %><%= global.dist.vendor %>'
                    },
                    {
                        expand : true,
                        cwd    : 'bower_components/zepto',
                        src    : ['zepto.min.js'],
                        dest   : '<%= global.dist.root %><%= global.dist.vendor %>'
                    },
                    {
                        expand : true,
                        cwd    : 'bower_components/zepto-data',
                        src    : ['zepto.data.min.js'],
                        dest   : '<%= global.dist.root %><%= global.dist.vendor %>'
                    }
                ]
            }
        },
        replace: {
            src_tabs_to_spaces: {
                src: ['<%= global.src %>*.js', '<%= global.src %>*.css', '<%= global.src %>*.html'],
                dest: '<%= global.src %>',
                replacements: [
                    {
                        from : '\t',
                        to   : '    '
                    }
                ]
            },
            jquery: {
                src: '<%= global.src %>demo.jquery.html',
                dest: '<%= global.dist.root %>demo.jquery.html',
                replacements: [
                    {
                        from : 'src="jqthumb.js"',
                        to   : 'src="jqthumb.min.js"'
                    },
                    {
                        from : '../bower_components/jquery/jquery.js',
                        to   : '<%= global.dist.vendor %>jquery.js'
                    }
                ]
            },
            zepto: {
                src: '<%= global.src %>demo.zepto.html',
                dest: '<%= global.dist.root %>demo.zepto.html',
                replacements: [
                    {
                        from : 'src="jqthumb.js"',
                        to   : 'src="jqthumb.min.js"'
                    },
                    {
                        from : '../bower_components/zepto/zepto.min.js',
                        to   : '<%= global.dist.vendor %>zepto.min.js'
                    },
                    {
                        from : '../bower_components/zepto-data/zepto.data.min.js',
                        to   : '<%= global.dist.vendor %>zepto.data.min.js'
                    }
                ]
            }
        },
        'screenshot-element': {
            demo: {
                options: {
                    streamType: 'jpg',
                    quality: 60,
                    timeout: 2000 /* wait for animation to be done */
                },
                images: [
                    {
                        url      : '<%= global.dist.root %>demo.html',
                        file     : 'screenshots/screenshot.jpg',
                        css      : 'body { background-color: #FFF; }',
                        selector : '.screenshot-area'
                    }/*,
                    {
                        url      : '<%= global.dist.root %>demo.zepto.html',
                        file     : 'screenshots/screenshot.zepto.jpg',
                        css      : 'body { background-color: #FFF; }',
                        selector : '.screenshot-area'
                    }*/
                ]
            }
        },
        bump: {
            options: {
                files              : ['package.json'],
                updateConfigs      : ['pkg'],
                commit             : true,
                commitMessage      : (function(){
                                        var commitMsg = grunt.option('commitmessage');
                                        if(commitMsg){
                                            return commitMsg;
                                        }
                                        var returnTxt     = 'v%VERSION%\n',
                                            changeLogFile = 'CHANGELOG.txt',
                                            data          = grunt.file.read(changeLogFile).toString(),
                                            lineArr       = data.split('\n'),
                                            search        = '# v' + pkg.version,
                                            newData       = '',
                                            found         = false,
                                            skip          = 2;

                                        if(data.indexOf(search) > -1){
                                            for(var i=0; i<lineArr.length-1; i++){
                                                if(lineArr[i].indexOf(search) > -1 || found === true){
                                                    if(lineArr[i + skip].length > 0){
                                                        returnTxt += lineArr[i + skip] + '\n';
                                                        found = true;
                                                    }else{
                                                        found = false;
                                                        break;
                                                    }
                                                }
                                            }
                                        }else{
                                            throw new Error('You have not updated ' + changeLogFile);
                                        }
                                        return returnTxt;
                                    })(),
                commitFiles        : ['-a'],
                createTag          : true,
                tagName            : 'v%VERSION%',
                tagMessage         : 'Version %VERSION%',
                push               : 'branch',
                pushTo             : 'origin',
                gitDescribeOptions : '--tags --always --abbrev=1 --dirty=-d',
                globalReplace      : true,
                // prereleaseName     : 'rc',
                metadata           : '',
                regExp             : false
            }
        }

    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-text-replace');
    grunt.loadNpmTasks('grunt-screenshot-element');
    grunt.loadNpmTasks('grunt-bump');

    /* Update version in readme file by checking if the first line of the file contains the latest version. */
    grunt.registerTask('update-readme', '', function () {
        var readMeFile     = 'README.md',
            replaceLineOne = '#' + pkg.name + ' v' + pkg.version,
            data           = grunt.file.read(readMeFile).toString();

        if(data.indexOf(replaceLineOne) > -1){
            console.log(readMeFile + ' is updated.');
        }else{
            var newData = replaceLineOne + data.substr(data.indexOf('\n'), data.length);
            grunt.file.write(readMeFile, newData);
            console.log(readMeFile + ' version has been updated to ' + pkg.version);
        }
    });

    /* Check if you have already updated change log with latest version by searching the latest version from the file. */
    grunt.registerTask('check-changelog', '', function () {
        var changeLogFile = 'CHANGELOG.txt',
            data          = grunt.file.read(changeLogFile).toString(),
            lineArr       = data.split('\n'),
            search        = '# v' + pkg.version,
            newData       = '';

        if(data.indexOf(search) > -1){
            for(var i=0; i<lineArr.length-1; i++){
                if(lineArr[i].indexOf(search) > -1){
                    newData += search + ' (' + grunt.template.today("dddd, mmmm dS, yyyy, h:MM:ss TT") + ')\n';
                }else{
                    newData += lineArr[i] + '\n';
                }
            }
            grunt.file.write(changeLogFile, newData);
            console.log('Change log is updated.');
        }else{
            throw new Error('You have not updated ' + changeLogFile);
        }
    });

    /* Update version in bower.json file by checking if the file contains the latest version. */
    grunt.registerTask('check-bowerjson', '', function () {
        var filePath = 'bower.json',
            obj  = grunt.file.readJSON(filePath);

        if(obj.version != pkg.version){
            var data = grunt.file.read(filePath, 'utf8').toString(),
                lineArr = data.split('\n'),
                newData = '';

            for(var i=0; i<lineArr.length-1; i++){
                if(lineArr[i].indexOf('version') > -1 && lineArr[i].indexOf(obj.version)){
                    newData += lineArr[i].replace(obj.version, pkg.version) + '\n';
                }else{
                    newData += lineArr[i] + '\n';
                }
            }
            if(newData.length > 0){
                grunt.file.write(filePath, newData, 'utf8');
                console.log(filePath + ' version has been updated to ' + pkg.version);
            }else{
                throw new Error('Error in updating ' + filePath);
            }
        }else{
            console.log(filePath + ' is updated.');
        }
    });

    /* Update version in jqthumb.jquery.json file by checking if the file contains the latest version. */
    grunt.registerTask('check-jqueryjson', '', function () {
        var filePath = pkg.filename + '.jquery.json',
            obj  = grunt.file.readJSON(filePath);

        if(obj.version != pkg.version){
            var data = grunt.file.read(filePath, 'utf8').toString(),
                lineArr = data.split('\n'),
                newData = '';

            for(var i=0; i<lineArr.length-1; i++){
                if(lineArr[i].indexOf('version') > -1 && lineArr[i].indexOf(obj.version)){
                    newData += lineArr[i].replace(obj.version, pkg.version) + '\n';
                }else{
                    newData += lineArr[i] + '\n';
                }
            }
            if(newData.length > 0){
                grunt.file.write(filePath, newData, 'utf8');
                console.log(filePath + ' version has been updated to ' + pkg.version);
            }else{
                throw new Error('Error in updating ' + filePath);
            }
        }else{
            console.log(filePath + ' is updated.');
        }
    });

    grunt.registerTask('check-license-date', '', function(){
        var filePath = 'LICENSE.txt',
            data     = grunt.file.read(filePath).toString(),
            lineArr  = data.split('\n'),
            year     = grunt.template.today("yyyy"),
            newData  = '';

        if(data.indexOf(year) < 0){
            lineArr[0] = 'Copyright (c) 2014-' + year + ' ' + pkg.author;
            newData = lineArr.join('\n');
            if(newData.length > 0){
                grunt.file.write(filePath, newData, 'utf8');
            }
        }
    });

    grunt.registerTask('dev', ['jshint', 'concat', 'uglify', 'copy', 'replace']);
    grunt.registerTask('default', [
        'jshint', 
        'concat', 
        'uglify', 
        'copy', 
        'replace', 
        'update-readme', 
        'check-changelog', 
        'check-bowerjson', 
        'check-jqueryjson', 
        'check-license-date', 
        'screenshot-element'
    ]);

    /*
    GRUNT BUMP EXAMPLES:
    grunt bump --setversion=X.X.X --commitmessage="commit message" --dry-run
        - it will read from CHANGELOG.txt when "commitmessage" is not set to anything
        - to have new line in commit message, simply type CTRL+V+J
        - with dry-run, it will only show the demo.
    */
};