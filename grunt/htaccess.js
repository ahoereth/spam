// index.js - grunt task
// Redies the .htaccess file from /src for production to /app
//   htaccess

/* global module, require, console */
module.exports = function(grunt) {
  'use strict';

  var description =  'Build refreshed ".htaccess" file.';

  var task = function() {
    var fs = require('fs');
    fs.readFile('src/.htaccess', 'utf8', function (err,data) {
      if (err) { return console.log(err); }
      var result = data.replace( /###/g, '' );

      fs.writeFile('app/.htaccess', result, 'utf8', function (err) {
        if (err) { return console.log(err); }
      });
    });
  };

  grunt.task.registerTask('htaccess', description, task);
};
