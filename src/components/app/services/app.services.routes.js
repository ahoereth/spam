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
      'ngRoute',
      'spam.user.services.auth'
    ])
    .provider('Routes', routesProvider)
    .run(routesInitialization)
    .config(routesProviderInit)
    .constant('HTML5MODE', true)
    .constant('HASHPREFIX', '!');




  /* @ngInject */
  function routesInitialization(
    $location,
    $rootScope,
    $route // Required for initializing the root route.
   ) {
    // Handle errors occurring on route changing. This is called when one of the
    // promises to be resolved before visiting the route is rejected.
    $rootScope.$on('$routeChangeError', function(
      event, current, previous, rejection
    ) {
      if ('not_authenticated' === rejection) {
        var requested = $location.path();
        $location.path('/401').search('path', requested);
      } else {
        $location.path('/login');
      }
    });

    // Called on every route change for user authentication verification and
    // possible redirecting.
    $rootScope.$on('$routeChangeSuccess', function(event, current, previous) {
      if (!current) { return; }

      // Don't allow entering the page on /401
      if (current.originalPath === '/401' && !previous) {
        $location.path('/').search({});
        return;
      }

      // Handle page title.
      $rootScope.$broadcast('title', current.title, true);
    });
  }




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
