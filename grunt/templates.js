// templates.js - grunt task
// Minify HTML templates and bundle them in a JavaScript file for deployment.
//   ngtemplates

/* global module */
module.exports = function(grunt) {
  'use strict';
  var ngtemplates = grunt.config('ngtemplates') ||  {};

  ngtemplates.spam = {
    cwd: 'src',
    src: [
      'components/**/*.html',
      'partials/**/*.html',
      '!**/*.ignore.html',
    ],
    dest: 'app/js/tmp.templates.js',
    options: {
      module: 'spam.app',
      standalone: false,
      htmlmin: {
        collapseBooleanAttributes: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true,
        removeEmptyAttributes: true,
        removeRedundantAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        removeComments: true,
        customAttrCollapse: /.+/,
      }
    }
  };

  grunt.config('ngtemplates', ngtemplates);
  grunt.loadNpmTasks('grunt-angular-templates');
};
