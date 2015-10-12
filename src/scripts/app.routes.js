(function() {
  'use strict';

  angular
    .module('spam')
    .config(routing);

  var html5mode = true;
  var hashPrefix = '!';
  var routes = {

    // **********
    // Login
    '/login': {
      templateUrl: 'login.html',
      controller: 'Login',
      title: 'Login',
      access: 0
    },

    // **********
    // Page not found error
    '/401': {
      templateUrl: '401.html',
      title: 'Page not found',
      access: 0
    },

    // **********
    // guide
    '/guide': {
      templateUrl: 'guide/index.html',
      controller: 'GuideCtrl',
      title: 'Guide',
      access: 0
    },

    // **********
    // admin task index
    '/admin': {
      templateUrl: 'admin/index.html',
      title: 'Administration',
      access: 32
    },

    // **********
    // admin task index
    '/admin/migrate': {
      templateUrl: 'admin/migrate.html',
      title: 'Migration',
      access: 32,
      controller: 'AdminMigrateController',
      controllerAs: 'migrate'
    },

    // **********
    // required for using relative root ('/') links
    '/.': {
      redirectTo: '/'
    }
  };


  /* @ngInject */
  function routing(
    $routeProvider,
    $locationProvider
  ) {
    $locationProvider.html5Mode(html5mode).hashPrefix(hashPrefix);

    var auth = {
      /* @ngInject */
      authentication: function($route, Auth) {
        return Auth.authenticate($route.current.access);
      }
    };

    var templateUrlBase = 'partials/';

    // Initiate every route.
    angular.forEach(routes, function(options, route) {
      if (options.hasOwnProperty('templateUrl')) {
        options.templateUrl = templateUrlBase + options.templateUrl;
      }

      if (! options.hasOwnProperty('redirectTo')) {
        options.resolve = auth;
      }

      $routeProvider.when(route, options);
    });

    // Redirect everything else to the root/landing page.
    $routeProvider.otherwise({ redirectTo: '/' });
  }
})();
