// uglify.js - grunt task
// Minify JavaScript for deployment.
// -- Requires ngAnnotate task to be run first for making angular's
// dependency injection minification save!
//   uglify
//   uglify:build

/* global module, require */
module.exports = function(grunt) {
  'use strict';
  var uglify = grunt.config('uglify') ||  {};

  uglify.options = {
    mangle: true,
    compress: {
      unsafe: true,
      hoist_funs: false,
      warnings: false,
    },
    beautify: false
  };

  var dependencies = require('wiredep')({
    exclude: grunt.config.get('bwr').exclude
  });

  uglify.build = {
    files: {
      'app/js/spamin.js': dependencies.js.concat([
        'app/js/tmp.app.js'
      ])
    }
  };

  grunt.config('uglify', uglify);
  grunt.loadNpmTasks('grunt-contrib-uglify');
};
