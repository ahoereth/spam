(function() {
  'use strict';

  /**
   * MODULE: spam.components.landing
   * ROUTE: /
   */
  angular
    .module('spam.components.landing', [
      'spam.components.app.services.routes'
    ])
    .config(landingRouting);




  /* @ngInject */
  function landingRouting(RoutesProvider) {
    RoutesProvider.add('/', {
      templateUrl: '/components/landing/landing.html'
    });
  }

})();
