(function() {
  'use strict';

  /**
   * MODULE: spam.app.services.routes
   * SERVICE: Routes
   * CONSTANTS:
   *   HTML5MODE
   *   HASHPREFIX
   *
   * Wrapper around the user router.
   */
  angular
    .module('spam.app.services.routes', [
      'ngRoute'
    ])
    .provider('Routes', routesProvider)
    .config(routesProviderInit)
    .constant('HTML5MODE', true)
    .constant('HASHPREFIX', '!');




  function routesProvider() {
    var $routeProvider;

    /* @ngInject */
    var authentication = function($route, Auth) {
      return Auth.authenticate($route.current.access);
    };

    // Store $routeProvider during config phase for later use.
    this.setRouteProvider = function($rp) {
      $routeProvider = $rp;
    };

    // Adds routes to the actual router.
    this.add = function(path, options) {
      if (!options) {
        return false;
      }

      if (!options.redirectTo) {
        // Add authentication resolve function.
        options.resolve = options.resolve || {};
        options.resolve.auth = authentication;

        // Default access is public.
        options.access = options.access || 0;

        // Default title is empty.
        options.title = options.title || '';
      }

      if ('*' === path) {
        $routeProvider.otherwise(options);
      } else {
        $routeProvider.when(path, options);
      }

      return true;
    };

    // Return service.
    this.$get = function() {
      return {};
    };
  }




  // Store $routeProvider for later use and set $locationProvider options.
  function routesProviderInit(
    $routeProvider,
    $locationProvider,
    RoutesProvider,
    HTML5MODE,
    HASHPREFIX
  ) {
    RoutesProvider.setRouteProvider($routeProvider);

    $locationProvider
      .html5Mode(HTML5MODE)
      .hashPrefix(HASHPREFIX);
  }

})();
