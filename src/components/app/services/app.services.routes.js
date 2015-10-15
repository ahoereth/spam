(function() {
  'use strict';

  /**
   * MODULE: spam.components.app.services.routes
   *
   * Wrapper around the user router.
   */
  angular
    .module('spam.components.app.services.routes', [
      'ngRoute'
    ])
    .provider('Routes', routesProvider)
    .config(routesProviderInit);




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

      $routeProvider.when(path, options);
      return true;
    };

    // Return service.
    this.$get = function() {
      return {};
    };
  }




  // Store `$routeProvider` during config phase for later use.
  function routesProviderInit($routeProvider, RoutesProvider) {
    RoutesProvider.setRouteProvider($routeProvider);
  }

})();