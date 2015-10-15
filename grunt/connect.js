// connect.js - grunt task
// Start local development server with a connection to the production database.
//   connect
//   connect:dev  - starts the development version from /src
//   connect:demo - starts the deployed app from /app

/* global module, require */
module.exports = function(grunt) {
  'use strict';
  var connect = grunt.config('connect') ||  {};
  var rewrite = [
    '!\\.html|\\.js|\\.svg|\\.css|\\.png|\\.jpg|\\.woff|\\.ttf|\\.less$ ' +
    '/index.html [L]'
  ];

  var modRewrite = require('connect-modrewrite');
  var mountFolder = function(connect, dir) {
    return connect.static(require('path').resolve(dir));
  };

  connect.options = {
    port: 8000,
    hostname: '0.0.0.0',
    open: false
  };

  connect.dev = {
    options: {
      base: 'src',
      livereload: true,
      middleware: function(connect) {
        return [
          modRewrite(rewrite),
          mountFolder(connect, 'src')
        ];
      }
    }
  };

  connect.demo = {
    options: {
      keepalive: true,
      base: 'app',
      middleware: function(connect) {
        return [
          modRewrite(rewrite),
          mountFolder(connect, 'app')
        ];
      }
    }
  };

  grunt.config('connect', connect);
  grunt.loadNpmTasks('grunt-contrib-connect');
};
