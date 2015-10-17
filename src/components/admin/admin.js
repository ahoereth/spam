(function() {
  'use strict';


  /**
   * MODULE: spam.admin
   * ROUTES:
   *   /admin
   *   /admin/migrate
   */
  angular
    .module('spam.admin', [
      'spam.admin.index',
      'spam.admin.migrate'
    ]);

})();
