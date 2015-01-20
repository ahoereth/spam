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

  // Set default task
  grunt.task.registerTask('default', ['start']);
};
