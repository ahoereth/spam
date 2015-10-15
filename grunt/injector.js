// injector.js - grunt task
// Insert JavaScript and CSS references (script & link tags) into the
// development index.html file.
//   injector
//   injector:dev

/* global require, module */
var path = require('path');
var ext = function(file) {
  return path.extname(file).slice(1);
};

module.exports = function(grunt) {
  'use strict';
  var injector = grunt.config('injector') ||  {};

  injector.options = {
    relative: true,
    addRootSlash: false,
    transform: function (filepath) {
      var e = ext(filepath);
      if (e === 'css') {
        return '<link rel="stylesheet" href="' + filepath + '">';
      } else if (e === 'less') {
        return '<link rel="stylesheet/less"  type="text/css" href="' + filepath + '">';
      } else if (e === 'js') {
        return '<script src="' + filepath + '"></script>';
      } else if (e === 'html') {
        return '<link rel="import" href="' + filepath + '">';
      }
    }
  };

  injector.dev = {
    files: {
      'src/index.html': [
        'src/**/*.js',
        'src/**/*.less',
        'src/**/*.css',
        '!**/*.ignore.*',
        '!**/_*.less',
        '!src/lib/**'
      ]
    }
  };

  grunt.config('injector', injector);
  grunt.loadNpmTasks('grunt-injector');
};
