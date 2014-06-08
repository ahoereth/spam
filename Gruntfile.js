module.exports = function(grunt) {

  var pkg = grunt.file.readJSON('package.json');

  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-ngmin');
  grunt.loadNpmTasks('grunt-bump');
  grunt.loadNpmTasks('grunt-banner');
  grunt.loadNpmTasks('grunt-angular-templates');


  grunt.initConfig({
    pkg: pkg,

    clean: {
      dev: ['src/fonts'],

      before: ['app/**/**'],

      after: ['app/js/tmp.*.js']
    },


    copy: {
      dev: {
        expand: true,
        flatten: true,
        filter: 'isFile',
        cwd: 'bower_components',
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
          'robots.txt'
        ],
        dest: 'app',
        expand: true
      }
    },


    less: {
      dev: {
        files: {
          "src/styles/app.css": "src/styles/app.less"
        }
      },

      build: {
        options: {
          cleancss: true,
          compress: true
        },
        files: {
          "app/css/spamin.css": "src/styles/app.less"
        }
      }
    },


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


    ngmin: {
      // requires uglify task afterwards for merging this with bower_components
      build: {
        files: {
          'app/js/tmp.app.js': [
            'src/scripts/controllers.js',
            'src/scripts/controllers/*.js',

            'src/scripts/services.js',
            'src/scripts/services/*.js',

            'src/scripts/filters.js',
            'src/scripts/filters/*.js',

            'src/scripts/directives.js',
            'src/scripts/directives/*.js',

            'src/scripts/app.js',

            'app/js/tmp.templates.js'
          ]
        }
      }
    },


    uglify: {
      // requires ngmin task to be run first for dependency injection
      options: {
        mangle: true,
        compress: {
          sequences     : true,  // join consecutive statemets with the “comma operator”
          properties    : true,  // optimize property access: a["foo"] → a.foo
          dead_code     : true,  // discard unreachable code
          drop_debugger : true,  // discard “debugger” statements
          unsafe        : true, // some unsafe optimizations (see below)
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
            'bower_components/lodash/dist/lodash.min.js',
            'bower_components/underscore.string/dist/underscore.string.min.js',

            'bower_components/angular/angular.js',
            'bower_components/angular-route/angular-route.js',
            'bower_components/angular-sanitize/angular-sanitize.js',

            'bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
            'bower_components/restangular/dist/restangular.js',

            'app/js/tmp.app.js' // contains src/scripts/** and src/partials/**
          ]
        }
      }
    },


    watch: {
      styles_dev: {
        files: [ 'src/styles/**/*.less' ],
        tasks: [ 'less:dev' ]
      },

      styles_build: {
        files: [ 'src/styles/**/*.less' ],
        tasks: [ 'less:build' ]
      },

      scripts_build: {
        files: [ 'src/scripts/**/*.js' ],
        tasks: [ 'scripts' ]
      },

      copy_dev: {
        files: [
          'bower_components/bootstrap/dist/fonts/*',
          'bower_components/open-sans-fontface/fonts/**'
        ],
        tasks: [ 'copy:dev' ]
      },

      copy_build: {
        files: [
          'src/partials/**',
          'src/fonts/**',
          'src/robots.txt'
        ],
        tasks: [ 'copy:build' ]
      },

      index: {
        files: [ 'src/index-ship.html' ],
        tasks: [ 'index' ]
      },

      htaccess: {
        files: [ 'src/.htaccess' ],
        tasks: [ 'htaccess' ]
      }
    },

    usebanner: {
      build: {
        options: {
          banner: "// <%= pkg.name %> - v<%= pkg.version %> - " +
                  "<%= grunt.template.today('yyyy-mm-dd') %>",
          linebreak: true
        },
        files: {
          src: [ 'app/css/spamin.css', 'app/js/spamin.js' ]
        }
      }
    },

    bump: {
      options: {
        pushTo: 'origin'
      }
    }

  });


  // builds the production index.html file by replacing all "VERSION" strings
  // with the current timestamp
  grunt.registerTask('index', 'Create new index.', function() {
    var fs = require('fs');
    fs.readFile('src/index-ship.html', 'utf8', function (err,data) {
      if (err) return console.log(err);
      var result = data.replace( /VERSION/g, pkg.version );

      fs.writeFile('app/index.html', result, 'utf8', function (err) {
        if (err) return console.log(err);
      });
    });
  });

  // builds the prduction .htaccess by removing triple hashtags
  grunt.registerTask('htaccess', 'Deploy htaccess.', function() {
    var fs = require('fs');
    fs.readFile('src/.htaccess', 'utf8', function (err,data) {
      if (err) return console.log(err);
      var result = data.replace( /###/g, '' );

      fs.writeFile('app/.htaccess', result, 'utf8', function (err) {
        if (err) return console.log(err);
      });
    });
  });


  // used for lesser processor load when developing
  grunt.registerTask(
    'devWatch',
    'Watches for less and font changes and builds them to the src directory.',
    ['watch:styles_dev', 'watch:copy_dev']
  );

  // only required for production
  grunt.registerTask(
    'scripts',
    'Build and minify scripts for production.',
    ['ngtemplates', 'ngmin', 'uglify']
  );


  grunt.registerTask(
    'build',
    'Runs all tasks so the app can be run from /app or /src.',
    ['clean', 'copy', 'index', 'htaccess', 'less', 'scripts', 'usebanner', 'clean:after']
  );


  grunt.registerTask(
    'default',
    'Builds from source and watches for new changes to write to the src directory.',
    ['build', 'devWatch']
  );

};
