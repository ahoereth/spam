// dev.js - grunt task
// Refresh the development source code and start watching it for ongoing
// changes.
//   dev

/* global module */
module.exports = function(grunt) {
  'use strict';

  var description = 'Refresh the development source code and start ' +
    'watching it for ongoing changes.';

  var task = [
    'clean:dev',
    'less:dev',
    'copy:dev',
    'wiredep',
    'injector',
    'connect:dev',
    'watch'
  ];

  grunt.task.registerTask('dev', description, task);
};
