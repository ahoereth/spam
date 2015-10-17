(function() {
  'use strict';

  /**
   * MODULE: spam.user
   * ROUTES:
   *   /login
   *   /~
   * SERVICES:
   *   User
   *   Auth
   */
  angular
    .module('spam.user', [
      'spam.user.services',
      'spam.user.index',
      'spam.user.settings',
      'spam.user.logout',
      'spam.user.courses',
      'spam.user.login'
    ]);

})();
