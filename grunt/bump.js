// bump.js - grunt task
// Bump version numbers on release.
// See https://github.com/vojtajina/grunt-bump
//   bump - same as bump:patch
//   bump:patch      - v#.#.#++
//   bump:minor      - v#.#++.#
//   bump:major      - v#++.#.#
//   bump:prerelease - v#.#.#-#++
//   bump --setversion=#.#.#

/* global module */
module.exports = function(grunt) {
  'use strict';
  var bump = grunt.config('bump') ||  {};

  bump.options = {
    pushTo: 'origin'
  };

  grunt.config('bump', bump);
  grunt.loadNpmTasks('grunt-bump');
};
