// less.js - grunt task
// Compiling less styles to css.
//   less
//   less:dev   - unminified
//   less:build - minified

/* global module */
module.exports = function(grunt) {
  'use strict';
  var less = grunt.config('less') ||  {};

  // **********
  // compile styles
  less.dev = { // non minified for development
    files: {
      'src/styles/app.css': 'src/styles/app.less'
    }
  };

  less.build = { // minified for production
    options: {
      cleancss: true,
      compress: true
    },
    files: {
      'app/css/spamin.css': 'src/styles/app.less'
    }
  };


  grunt.config('less', less);
  grunt.loadNpmTasks('grunt-contrib-less');
};
