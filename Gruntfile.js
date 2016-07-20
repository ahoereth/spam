// Gruntfile.js

/* global module */
module.exports = function(grunt) {
  'use strict';

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    bwr: grunt.file.readJSON('bower.json')
  });

  // Load all tasks from dir ./grunt
  grunt.task.loadTasks('grunt');

  /////////////////////////////////////////////////////////////////////////////
  /// `start` task
  var description =  'Start a local app server with a connection to the ' +
    'production database. App auto refreshs on code changes.';
  grunt.task.registerTask('start', description, function(arg) {
    if (arg !== 'demo') {
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
        'connect:demo',
        'watch'
      ]);
    }
  });

  /////////////////////////////////////////////////////////////////////////////
  /// `build` task
  description = 'Build the app to /app such that it is ready to be ' +
    'deployed to the production server.';
  grunt.task.registerTask('build', description, [
    'clean',
    'copy',
    'index',
    'htaccess',
    'less',
    'ngtemplates',
    'ngAnnotate',
    'uglify',
    'clean:after'
  ]);


  // Set default task
  grunt.task.registerTask('default', ['start']);
};
