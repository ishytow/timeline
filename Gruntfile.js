'use strict';
var LIVERELOAD_PORT = 35729;
var SERVER_PORT = 9000;
var lrSnippet = require('connect-livereload')({port: LIVERELOAD_PORT});
var mountFolder = function (connect, dir) {
    return connect.static(require('path').resolve(dir));
};

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to match all subfolders:
// 'test/spec/**/*.js'
// templateFramework: 'handlebars'

module.exports = function (grunt) {
    // show elapsed time at the end
    require('time-grunt')(grunt);
    // load all grunt tasks
    require('load-grunt-tasks')(grunt);

    // configurable paths
    var yeomanConfig = {
        app: 'app',
        dist: 'dist'
    };

    grunt.initConfig({
        yeoman: yeomanConfig,
        watch: {
            options: {
                nospawn: true,
                livereload: LIVERELOAD_PORT
            },
            livereload: {
                options: {
                    livereload: grunt.option('livereloadport') || LIVERELOAD_PORT
                },
                files: [
                    '<%= yeoman.app %>/*.html',
                    '{.tmp,<%= yeoman.app %>}/styles/{,*/}*.css',
                    '{.tmp,<%= yeoman.app %>}/scripts/{,*/}*.js',
                    '<%= yeoman.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp}',
                    '<%= yeoman.app %>/scripts/templates/*.{ejs,mustache,hbs}',
                    'test/spec/**/*.js'
                ]
            },
            handlebars: {
                files: [
                    '<%= yeoman.app %>/scripts/templates/*.hbs'
                ],
                tasks: ['handlebars']
            }
        },
        less: {
            dev: {
                options: {
                    cleancss: true
                },
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.app %>/styles/less',
                    src: ['*.less'],
                    dest: '<%= yeoman.app %>/styles/',
                    ext: '.css'
                }]
            }
        },
        concat_css: {
            options: {
                separator: ';'
            },
            dist: {
                src: [
                    '<%= yeoman.app %>/styles/*.css',
                    '<%= yeoman.app %>/bower_components/bootstrap/dist/css/bootstrap.min.css',
                    '<%= yeoman.app %>/bower_components/vis/dist/vis.min.css'
                ],
                dest: '<%= yeoman.dist %>/styles/main.css'
            }
        },
        connect: {
            options: {
                port: grunt.option('port') || SERVER_PORT,
                // change this to '0.0.0.0' to access the server from outside
                hostname: 'localhost'
            },
            livereload: {
                options: {
                    middleware: function (connect) {
                        return [
                            lrSnippet,
                            mountFolder(connect, '.tmp'),
                            mountFolder(connect, yeomanConfig.app)
                        ];
                    }
                }
            },
            test: {
                options: {
                    port: 9001,
                    middleware: function (connect) {
                        return [
                            mountFolder(connect, 'test'),
                            lrSnippet,
                            mountFolder(connect, '.tmp'),
                            mountFolder(connect, yeomanConfig.app)
                        ];
                    }
                }
            },
            dist: {
                options: {
                    middleware: function (connect) {
                        return [
                            lrSnippet,
                            mountFolder(connect, yeomanConfig.dist)
                        ];
                    }
                }
            }
        },
        open: {
            server: {
                path: 'http://localhost:<%= connect.options.port %>'
            },
            test: {
                path: 'http://localhost:<%= connect.test.options.port %>'
            }
        },
        clean: {
            dist: ['.tmp', '<%= yeoman.dist %>/*'],
            server: '.tmp'
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish')
            },
            all: [
                'Gruntfile.js',
                '<%= yeoman.app %>/scripts/{,*/}*.js',
                '!<%= yeoman.app %>/scripts/vendor/*',
                'test/spec/{,*/}*.js'
            ]
        },
        copy: {
            dist: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%= yeoman.app %>',
                    dest: '<%= yeoman.dist %>',
                    src: [
                        '*.{html,ico,txt}',
                        'images/{,*/}*.{webp,gif}',
                        'styles/fonts/{,*/}*.*'
                    ]
                }, {
                    expand: true,
                    dot: true,
                    cwd: '<%= yeoman.app %>/bower_components/bootstrap/dist/fonts',
                    dest: '<%= yeoman.dist %>/fonts',
                    src: [
                        '*.{eot,svg,ttf,woff,woff2}'
                    ]
                }, {
                    src: 'node_modules/apache-server-configs/dist/.htaccess',
                    dest: '<%= yeoman.dist %>/.htaccess'
                }, {
                    src: '<%= yeoman.app %>/bower_components/requirejs/require.js',
                    dest: '<%= yeoman.dist %>/scripts/require.js'
                }]
            }
        },
        bower: {
            all: {
                rjsConfig: '<%= yeoman.app %>/scripts/main.js'
            }
        },
        handlebars: {
            compile: {
                options: {
                    namespace: 'JST',
                    amd: true
                },
                files: {
                    '.tmp/scripts/templates.js': ['<%= yeoman.app %>/scripts/templates/*.hbs']
                }
            }
        },
        requirejs: {
            dist: {
                options: {
                    mainConfigFile: '<%= yeoman.app %>/scripts/main.js',
                    name: 'main',
                    wrapShim: false,
                    out: '<%= yeoman.dist %>/scripts/main.js',
                    findNestedDependencies: true,
                    optimize: "uglify2",
                    uglify2: {
                        options: {
                            mangle: true,
                            compress: {
                                sequences: true,
                                dead_code: true,
                                conditionals: true,
                                booleans: true,
                                unused: true,
                                if_return: true,
                                join_vars: true,
                                drop_console: true
                            }
                        }
                    },

                    '.tmp/scripts/templates.js': ['<%= yeoman.app %>/scripts/templates/*.hbs']
                }
            },
            distDebug: {
                options: {
                    mainConfigFile: '<%= yeoman.app %>/scripts/main.js',
                    name: 'main',
                    wrapShim: false,
                    out: '<%= yeoman.dist %>/scripts/main.js',
                    findNestedDependencies: true,
                    optimize: "none",

                    '.tmp/scripts/templates.js': ['<%= yeoman.app %>/scripts/templates/*.hbs']
                }
            }
        }
    });

    grunt.registerTask('createDefaultTemplate', function () {
        grunt.file.write('.tmp/scripts/templates.js', 'this.JST = this.JST || {};');
    });

    grunt.registerTask('server', function (target) {
        grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
        grunt.task.run(['serve' + (target ? ':' + target : '')]);
    });

    grunt.registerTask('serve', function (target) {
        if (target === 'dist') {
            return grunt.task.run([
                'build',
                'clean:server',
                'createDefaultTemplate',
                'handlebars',
                'connect:dist',
                'open:server',
                'watch'
            ]);
        }

        if (target === 'test') {
            return grunt.task.run([
                'clean:server',
                'createDefaultTemplate',
                'handlebars',
                'connect:test',
                'open:test',
                'watch'
            ]);
        }

        if (target === 'distDebug') {
            return grunt.task.run([
                'buildDebug',
                'clean:server',
                'createDefaultTemplate',
                'handlebars',
                'connect:dist',
                'open:server',
                'watch'
            ]);
        }

        grunt.task.run([
            'clean:server',
            'createDefaultTemplate',
            'handlebars',
            'connect:livereload',
            'open:server',
            'watch'
        ]);
    });

    grunt.registerTask('test', function (isConnected) {
        isConnected = Boolean(isConnected);
        var testTasks = [
                'clean:server',
                'createDefaultTemplate',
                'handlebars',
                'connect:test'
            ];

        if(!isConnected) {
            return grunt.task.run(testTasks);
        } else {
            // already connected so not going to connect again, remove the connect:test task
            testTasks.splice(testTasks.indexOf('connect:test'), 1);
            return grunt.task.run(testTasks);
        }
    });

    grunt.registerTask('build', [
        'clean:dist',
        'createDefaultTemplate',
        'handlebars',
        'less',
        'concat_css',
        'requirejs:dist',
        'copy'
    ]);

    grunt.registerTask('buildDebug', [
        'clean:dist',
        'createDefaultTemplate',
        'handlebars',
        'less',
        'concat_css',
        'requirejs:distDebug',
        'copy'
    ]);

    grunt.registerTask('default', [
        'jshint',
        'test',
        'build'
    ]);
};
