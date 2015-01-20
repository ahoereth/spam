// index.js - grunt task
// Builds the production 'index.html' file by replacing all 'VERSION' strings
// with the current timestamp.
//   index

/* global module, require, console */
module.exports = function(grunt) {
  'use strict';

  var description =  'Build refreshed "index.html" file.';

  var version = grunt.config.get('pkg').version;

  var task = function() {
    var fs = require('fs');
    fs.readFile('src/index-ship.html', 'utf8', function (err,data) {
      if (err) { return console.log(err); }
      var result = data.replace( /VERSION/g, version + '-' + Date.now() );

      fs.writeFile('app/index.html', result, 'utf8', function (err) {
        if (err) { return console.log(err); }
      });
    });
  };

  grunt.task.registerTask('index', description, task);
};
