// annotate.js - grunt task
// Annotate AngularJS code for dependency injection save minification.
//   ngAnnotate
//   ngAnnotate:dev

/* global module */
module.exports = function(grunt) {
  'use strict';
  var ngAnnotate = grunt.config('ngAnnotate') ||  {};

  ngAnnotate.build = {
    files: {
      'app/js/tmp.app.js': [
        'src/scripts/**/*.js',
        '!src/scripts/**/*.ignore.js',
        'app/js/tmp.templates.js'
      ]
    }
  };

  grunt.config('ngAnnotate', ngAnnotate);
  grunt.loadNpmTasks('grunt-ng-annotate');
};
