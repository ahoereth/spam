// wiredep.js - grunt task
// Insert bower dependencies into their designated files.
//   wiredep
//   wiredep:dev

/* global module */
module.exports = function(grunt) {
  'use strict';
  var wiredep = grunt.config('wiredep') ||  {};

  wiredep.dev = {
    src: [
      'src/index.html',
      'src/components/style/bootstrap.less'
    ],
    options: {
      devDependencies: true,
      exclude: grunt.config.get('bwr').exclude
    }
  };

  grunt.config('wiredep', wiredep);
  grunt.loadNpmTasks('grunt-wiredep');
};
