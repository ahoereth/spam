// start.js - grunt task
// Start a local app server with a connection to the production database.
// App auto refreshs on code changes.
//   start      - from /src (raw)
//   start:demo - from /app (built)

/* global module */
module.exports = function(grunt) {
  'use strict';

  var description =  'Start a local app server with a connection to the ' +
    'production database. App auto refreshs on code changes.';

  var task = function(arg) {
    if (! arg || arg !== 'demo') {
      grunt.task.run([
        'clean:dev',
        'less:dev',
        'copy:dev',
        'wiredep',
        'injector',
        'connect:dev',
        'watch'
      ]);
    } else {
      grunt.task.run([
        'build',
        'connect:demo'
      ]);
    }
  };

  grunt.task.registerTask('start', description, task);
};
