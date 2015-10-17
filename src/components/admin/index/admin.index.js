(function() {
  'use strict';

  /**
   * MODULE: spam.admin.index
   * ROUTE: /admin
   */
  angular
    .module('spam.admin.index', [
      'spam.app.services.routes'
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
