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
        'src/scripts/controllers/*.js',
        'src/scripts/directives/*.js',
        'src/scripts/filters/*.js',
        'src/scripts/services/*.js',
        'src/scripts/*.js',
        'app/js/tmp.templates.js'
      ]
    }
  };

  grunt.config('ngAnnotate', ngAnnotate);
  grunt.loadNpmTasks('grunt-ng-annotate');
};
