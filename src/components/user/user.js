(function() {
  'use strict';

  /**
   * MODULE: spam.components.user
   * ROUTES:
   *   /login
   *   /~
   */
  angular
    .module('spam.components.user', [
      'spam.components.user.common',
      'spam.components.user.index',
      'spam.components.user.settings',
      'spam.components.user.logout',
      'spam.components.user.courses',
      'spam.components.user.login'
    ]);

})();