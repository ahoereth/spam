import angular from 'angular';
import ngRoute from 'angular-route';

import { HTML5MODE, HASHPREFIX } from '../constants';
import authService from '../../user/services/auth';


const routesInitialization = [
  '$location', '$rootScope', '$route',
  function routesInitialization($location, $rootScope, $route) {
    // Handle errors occurring on route changing. This is called when one of the
    // promises to be resolved before visiting the route is rejected.
    $rootScope.$on('$routeChangeError', (event, current, previous, rejection) => {
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
];


function routesProvider() {
  let $routeProvider;
  const authentication = ['$route', 'Auth', ($route, Auth) => {
    return Auth.authenticate($route.current.access);
  }];

  // Store $routeProvider during config phase for later use.
  this.setRouteProvider = $rp => { $routeProvider = $rp; };

  // Adds routes to the actual router.
  this.add = function(path, options) {
    if (!options) {
      return false;
    }

    if (!options.redirectTo) {
      options.resolve = options.resolve || {};
      options.resolve.auth = authentication;
      options.access = options.access || 0; // Default access is public.
      options.title = options.title || ''; // Default title is empty.
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
const routesProviderInit = [
  '$routeProvider', '$locationProvider', 'RoutesProvider',
  ($routeProvider, $locationProvider, RoutesProvider) => {
    RoutesProvider.setRouteProvider($routeProvider);
    $locationProvider.html5Mode(HTML5MODE).hashPrefix(HASHPREFIX);
  }
];


/**
 * MODULE: spam.app.services.routes
 * SERVICE: Routes
 */
export default angular
  .module('spam.app.services.routes', [ngRoute, authService])
  .provider('Routes', routesProvider)
  .run(routesInitialization)
  .config(routesProviderInit)
  .name;
