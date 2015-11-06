// less.js - grunt task
// Compiling less styles to css.
//   less
//   less:dev   - unminified
//   less:build - minified

/* global require, module */
module.exports = function(grunt) {
  'use strict';
  var less = grunt.config('less') ||  {};

  var plugins = [
    new (require('less-plugin-autoprefix'))({browsers: ['last 2 versions']})
  ];

  var dependencies = require('wiredep')({
    exclude: grunt.config.get('bwr').exclude
  });

  var glob = [
    'src/**/*.less',
    'src/components/**/*.css',
    '!src/**/*.ignore.less',
    '!src/**/_*.less',
    '!src/lib/**',
  ].concat(dependencies.css);

  // **********
  // compile styles
  less.dev = { // non minified for development
    options: {
      plugins: plugins
    },
    files: {
      'src/compiled.css': glob
    }
  };

  less.build = { // minified for production
    options: {
      cleancss: false,
      compress: false,
      plugins: plugins
    },
    files: {
      'app/css/spamin.css': glob
    }
  };

  grunt.config('less', less);
  grunt.loadNpmTasks('grunt-contrib-less');
};
