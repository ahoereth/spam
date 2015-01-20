// copy.js - grunt task
// Copying fonts and images to their deplyoment locations.
//   copy
//   copy:dev
//   copy:build

/* global module */
module.exports = function(grunt) {
  'use strict';
  var copy = grunt.config('copy') ||  {};

  copy.dev = {
    files: [
      {
        expand: true,
        src: ['src/lib/bootstrap/dist/fonts/*'],
        dest: 'src/fonts/glyphicons/',
        filter: 'isFile',
        flatten: true
      }, {
        expand: true,
        cwd: 'src/lib/open-sans-fontface/fonts',
        src: ['**'],
        dest: 'src/fonts/opensans/',
        filter: 'isFile',
        flatten: false
      }
    ]
/*    expand: true,
    flatten: true,
    filter: 'isFile',
    cwd: 'src/lib',
    src: [
      'bootstrap/dist/fonts/*',
      'open-sans-fontface/fonts/**'
    ],
    dest: 'src/fonts/'*/
  };

  copy.build = {
    cwd: 'src',
    src: [
      'fonts/**',
      'robots.txt',
      'img/**'
    ],
    dest: 'app',
    expand: true
  };

  grunt.config('copy', copy);
  grunt.loadNpmTasks('grunt-contrib-copy');
};
