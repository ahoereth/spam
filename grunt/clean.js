// clean.js - grunt task
// Cleaning deploy folders before and removing uneeded files after deployment.
//   clean
//   clean:dev
//   clean:before
//   clean:after

/* global module */
module.exports = function(grunt) {
  'use strict';
  var clean = grunt.config('clean') ||  {};

  clean.dev = ['src/fonts'];
  clean.before = ['app/**/**'];
  clean.after = ['app/js/tmp.*.js'];

  grunt.config('clean', clean);
  grunt.loadNpmTasks('grunt-contrib-clean');
};
