// build.js - grunt task
// Build the app to /app such that it is ready to be deployed to the
// production server.
//   build

/* global module */
module.exports = function(grunt) {
  'use strict';

  var description = 'Build the app to /app such that it is ready to be ' +
    'deployed to the production server.';

  var task = [
    'clean',
    'copy',
    'index',
    'htaccess',
    'less',
    'ngtemplates',
    'ngAnnotate',
    'uglify',
    'clean:after'
  ];

  grunt.task.registerTask('build', description, task);
};
