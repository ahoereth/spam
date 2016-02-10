// **********
// Watch files for livereloading and auto compiling during development.

// watch.js - grunt task
// Watch files and wait for changes to trigger live reloading and automatic
// less style compilation.
//   watch
//   watch:copy_dev
//   watch:styles_dev
//   watch:scripts
//   watch:html

/* global module */
module.exports = function(grunt) {
  'use strict';
  var watch = grunt.config('watch') ||  {};

  watch.options = {
    livereload: true,
  };

  watch.copy_dev = {
    files: [
      'src/lib/bootstrap/dist/fonts/*',
      'src/lib/open-sans-fontface/fonts/**'
    ],
    tasks: [ 'copy:dev' ]
  };

  watch.styles_dev = {
    files: [ 'src/**/*.less', 'src/**/*.css' ],
    tasks: [ 'less:dev', 'injector' ]
  };

  watch.scripts_dev = {
    files: [ 'src/**/*.js' ],
    tasks: [ 'injector' ]
  };

  watch.scripts_dist = {
    files: [ 'src/**/*.js' ],
    tasks: [
      'ngtemplates',
      'ngAnnotate',
      'uglify'
    ]
  };

  watch.bower = {
    files: [ 'bower.json' ],
    tasks: [ 'wiredep' ]
  };

  watch.html = {
    files: [ 'src/**/*.html' ]
  };

  grunt.config('watch', watch);
  grunt.loadNpmTasks('grunt-contrib-watch');
};
