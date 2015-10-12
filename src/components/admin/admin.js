(function() {
  'use strict';


  /**
   * MODULE: spam.components.admin
   * ROUTES:
   *   /admin
   *   /admin/migrate
   */
  angular
    .module('spam.components.admin', [
      'spam.components.admin.index',
      'spam.components.admin.migrate'
    ]);

})();
