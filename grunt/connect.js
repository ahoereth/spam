// connect.js - grunt task
// Start local development server with a connection to the production database.
//   connect
//   connect:dev  - starts the development version from /src
//   connect:demo - starts the deployed app from /app

var rewriteModule = require('http-rewrite-middleware');
var serveStatic = require('serve-static');

/* global module, require */
module.exports = function(grunt) {
  'use strict';
  var connect = grunt.config('connect') ||  {};

  connect.options = {
    port: 8000,
    hostname: '0.0.0.0',
    open: false,
    livereload: true,
    middleware: function(connect, options, middlewares) {
      middlewares.push(rewriteModule.getMiddleware([{
        from: '^\/api|(.*)(?!\.html|\.js|\.css|\.svg|\.woff2?|\.eot|\.ttf$)',
        to: '/#!/$1'
      }]));

      if (!Array.isArray(options.base)) {
        options.base = [options.base];
      }

      options.base.forEach(function(base) {
        middlewares.push(serveStatic(base));
      });

      return middlewares;
    }
  };

  connect.rules = [{
    from: '.*(?!\\.html|\\.js|\\.svg|\\.css|\\.png|\\.jpg|\\.woff|\\.ttf|\\.less)$',
    to: '/index.html'
  }];

  connect.dev = {
    options: {
      base: 'src'
    }
  };

  connect.demo = {
    options: {
      base: 'app'
    }
  };

  grunt.config('connect', connect);
  grunt.loadNpmTasks('grunt-contrib-connect');
};
