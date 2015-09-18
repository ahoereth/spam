(function() {
  'use strict';

  angular
    .module('spam.components.user', [
      'spam.components.user.common',
      'spam.components.user.index',
      'spam.components.user.settings',
      'spam.components.user.logout',
      'spam.components.user.courses'
    ]);
})();
