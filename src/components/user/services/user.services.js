(function() {
  'use strict';

  /**
   * MODULE: spam.components.app.services
   */
  angular
    .module('spam.components.user.services', [
      'spam.components.user.services.user',
      'spam.components.user.services.auth'
    ]);

})();
