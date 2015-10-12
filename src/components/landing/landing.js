(function() {
  'use strict';

  /**
   * MODULE: spam.components.landing
   * ROUTE: /
   */
  angular
    .module('spam.components.landing', [])
    .config(landingRouting);




  /* @ngInject */
  function landingRouting($routeProvider) {
    var auth = {
      /* @ngInject */
      authentication: function($route, Auth) {
        return Auth.authenticate($route.current.access);
      }
    };

    $routeProvider.when('/', {
      templateUrl: '/components/landing/landing.html',
      title: '',
      access: 0,
      resolve: auth
    });
  }

})();
