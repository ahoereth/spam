(function() {
  'use strict';

  /**
   * MODULE: spam.components.401
   * ROUTE: /401
   */
  angular
    .module('spam.components.401', [
      'spam.components.app.services.routes'
    ])
    .config(notauthorizedRouting);




  /* @ngInject */
  function notauthorizedRouting(RoutesProvider) {
    RoutesProvider.add('/401', {
      templateUrl: 'components/401/401.html',
      title: 'Not authorized.'
    });
  }

})();
