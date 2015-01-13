/* global module, require, console */
module.exports = function(grunt) {
  'use strict';

  var modRewrite = require('connect-modrewrite');
  var mountFolder = function(connect, dir) {
    return connect.static(require('path').resolve(dir));
  };

  var pkg = grunt.file.readJSON('package.json');

  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-ng-annotate');
  grunt.loadNpmTasks('grunt-bump');
  grunt.loadNpmTasks('grunt-angular-templates');
  grunt.loadNpmTasks('grunt-contrib-connect');


  grunt.initConfig({
    pkg: pkg,

    // **********
    // remove unneeded files
    clean: {
      dev: ['src/fonts'],
      before: ['app/**/**'],
      after: ['app/js/tmp.*.js']
    },

    // **********
    // copy fonts and images
    copy: {
      dev: {
        expand: true,
        flatten: true,
        filter: 'isFile',
        cwd: 'src/lib',
        src: [
          'bootstrap/dist/fonts/*',
          'open-sans-fontface/fonts/**'
        ],
        dest: 'src/fonts/'
      },

      build: {
        cwd: 'src',
        src: [
          'fonts/**',
          'robots.txt',
          'img/**'
        ],
        dest: 'app',
        expand: true
      }
    },


    // **********
    // compile styles
    less: {
      dev: { // non minified for development
        files: {
          'src/styles/app.css': 'src/styles/app.less'
        }
      },

      build: { // minified for production
        options: {
          cleancss: true,
          compress: true
        },
        files: {
          'app/css/spamin.css': 'src/styles/app.less'
        }
      }
    },


    // **********
    // minify html templates
    ngtemplates: {
      spam: {
        cwd: 'src',
        src: 'partials/**/**.html',
        dest: 'app/js/tmp.templates.js',
        options: {
          htmlmin: {
            collapseBooleanAttributes     : true,
            collapseWhitespace            : true,
            removeAttributeQuotes         : true,
            removeEmptyAttributes         : true,
            removeRedundantAttributes     : true,
            removeScriptTypeAttributes    : true,
            removeStyleLinkTypeAttributes : true,
            // beware of comment directives!
            removeComments                : true
          },
          bootstrap: function(module, script) {
            return "angular.module('"+module+"').run(function($templateCache) {\n"+script+" });";
          }
        }
      }
    },


    // **********
    // Prepare dependency injection for minification
    ngAnnotate: {
      build: {
        files: {
          'app/js/tmp.app.js': [
            'src/scripts/controllers/*.js',
            'src/scripts/directives/*.js',
            'src/scripts/filters/*.js',
            'src/scripts/services/*.js',
            'src/scripts/*.js',
            'app/js/tmp.templates.js'
          ]
        }
      }
    },


    // **********
    // Minify
    uglify: {
      // requires ngAnnotate task to be run first for dependency injection
      options: {
        mangle: true,
        compress: {
          sequences     : true,  // join consecutive statemets with the “comma operator”
          properties    : true,  // optimize property access: a["foo"] → a.foo
          dead_code     : true,  // discard unreachable code
          drop_debugger : true,  // discard “debugger” statements
         // unsafe        : true, // some unsafe optimizations (see below)
          conditionals  : true,  // optimize if-s and conditional expressions
          comparisons   : true,  // optimize comparisons
          evaluate      : true,  // evaluate constant expressions
          booleans      : true,  // optimize boolean expressions
          loops         : true,  // optimize loops
          unused        : true,  // drop unused variables/functions
          hoist_funs    : false,  // hoist function declarations
          hoist_vars    : false, // hoist variable declarations
          if_return     : true,  // optimize if-s followed by return/continue
          join_vars     : true,  // join var declarations
          cascade       : true,  // try to cascade `right` into `left` in sequences
          side_effects  : true,  // drop side-effect-free statements
          warnings      : false,  // warn about potentially dangerous optimizations/code
          global_defs   : {},     // global definitions
          pure_getters  : true,
          drop_console  : true
        },
        beautify: false
      },
      build: {
        files: {
          'app/js/spamin.js': [
            'src/lib/fastclick/lib/fastclick.js',
            'src/lib/lodash/dist/lodash.min.js',
            'src/lib/underscore.string/dist/underscore.string.min.js',

            'src/lib/angular/angular.min.js',
            'src/lib/angular-route/angular-route.min.js',
            'src/lib/angular-sanitize/angular-sanitize.min.js',

            'src/lib/angular-bootstrap/ui-bootstrap-tpls.min.js',
            'src/lib/restangular/dist/restangular.min.js',
            'src/lib/angular-utf8-base64/angular-utf8-base64.min.js',

            'app/js/tmp.app.js' // contains src/scripts/** and src/partials/**
          ]
        }
      }
    },


    // **********
    // Watch files for livereloading and auto compiling during development.
    watch: {
      options: {
        livereload: true,
      },

      styles_dev: {
        files: [ 'src/styles/**/*.less' ],
        tasks: [ 'less:dev' ]
      },

      scripts: {
        files: [ 'src/scripts/**.js' ]
      },

      html: {
        files: [ 'src/**.html' ]
      },

      copy_dev: {
        files: [
          'src/lib/bootstrap/dist/fonts/*',
          'src/lib/open-sans-fontface/fonts/**'
        ],
        tasks: [ 'copy:dev' ]
      },
    },


    // **********
    // Bump version numbers on release.
    bump: {
      options: {
        pushTo: 'origin'
      }
    },


    // **********
    // Local development server
    connect: {
      options: {
        port: 8000,
        hostname: 'localhost',
        open: true
      },
      dev: {
        options: {
          base: 'src',
          livereload: true,
          middleware: function(connect) {
            return [
              modRewrite(['!\\.html|\\.js|\\.svg|\\.css|\\.png|\\.jpg|\\.woff|\\.ttf$ /index.html [L]']),
              mountFolder(connect, 'src')
            ];
          }
        }
      },
      demo: {
        options: {
          base: 'app',
          middleware: function(connect) {
            return [
              modRewrite(['!\\.html|\\.js|\\.svg|\\.css|\\.png|\\.jpg|\\.woff|\\.ttf$ /index.html [L]']),
              mountFolder(connect, 'app')
            ];
          }
        }
      }
    }
  });


  // builds the production index.html file by replacing all "VERSION" strings
  // with the current timestamp
  grunt.registerTask('index', 'Create new index.', function() {
    var fs = require('fs');
    fs.readFile('src/index-ship.html', 'utf8', function (err,data) {
      if (err) { return console.log(err); }
      var result = data.replace( /VERSION/g, pkg.version + '-' + Date.now() );

      fs.writeFile('app/index.html', result, 'utf8', function (err) {
        if (err) { return console.log(err); }
      });
    });
  });

  // builds the prduction .htaccess by removing triple hashtags
  grunt.registerTask('htaccess', 'Deploy htaccess.', function() {
    var fs = require('fs');
    fs.readFile('src/.htaccess', 'utf8', function (err,data) {
      if (err) { return console.log(err); }
      var result = data.replace( /###/g, '' );

      fs.writeFile('app/.htaccess', result, 'utf8', function (err) {
        if (err) { return console.log(err); }
      });
    });
  });

  // only required for production
  grunt.registerTask(
    'scripts',
    'Build and minify scripts for production.',
    ['ngtemplates', 'ngAnnotate', 'uglify']
  );

  // build everything ready for deployment
  grunt.registerTask(
    'build',
    'Runs all tasks so the app can be run from /app or /src.',
    ['clean', 'copy', 'index', 'htaccess', 'less', 'scripts', 'clean:after']
  );

  // start local server for demoing the compiled code
  grunt.registerTask('demo', ['build', 'connect:demo']);

  // start local server for development
  grunt.registerTask('server', ['clean:dev', 'less:dev', 'copy:dev', 'connect:dev', 'watch']);
};
