// less.js - grunt task
// Compiling less styles to css.
//   less
//   less:dev   - unminified
//   less:build - minified

/* global module */
module.exports = function(grunt) {
  'use strict';
  var less = grunt.config('less') ||  {};

  var glob = [
    'src/styles/**/*.less',
    '!src/styles/**/*.ignore.less',
    '!src/styles/**/_*.less',
  ];

  // **********
  // compile styles
  less.dev = { // non minified for development
    files: {
      'src/styles/app.css': glob
    }
  };

  less.build = { // minified for production
    options: {
      cleancss: true,
      compress: true
    },
    files: {
      'app/css/spamin.css': glob
    }
  };


  grunt.config('less', less);
  grunt.loadNpmTasks('grunt-contrib-less');
};
