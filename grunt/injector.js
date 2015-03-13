// injector.js - grunt task
// Insert JavaScript and CSS references (script & link tags) into the
// development index.html file.
//   injector
//   injector:dev

/* global module */
module.exports = function(grunt) {
  'use strict';
  var injector = grunt.config('injector') ||  {};

  injector.options = {
    relative: true,
    addRootSlash: false
  };

  injector.dev = {
    files: {
      'src/index.html': [
        'src/components/**/*.js',
        '!src/components/**/*.ignore.js',
        'src/scripts/**/*.js',
        '!src/scripts/**/*.ignore.js',
        'src/styles/**/*.css'
      ]
    }
  };

  grunt.config('injector', injector);
  grunt.loadNpmTasks('grunt-injector');
};
