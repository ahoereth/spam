(function() {
  'use strict';

  /**
   * MODULE: spam.components.admin.index
   * ROUTE: /admin
   */
  angular
    .module('spam.components.admin.index', [
      'spam.components.app.services.routes'
    ])
    .config(adminIndexRouting);




  /* @ngInject */
  function adminIndexRouting(RoutesProvider) {
    RoutesProvider.add('/admin', {
      templateUrl: 'components/admin/index/admin.index.html',
      title: 'Administration',
      access: 32
    });
  }

})();
