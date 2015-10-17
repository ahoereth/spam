(function() {
  'use strict';

  /**
   * MODULE: spam.app
   */
  angular
    .module('spam.app', [
      'spam.app.run',
      'spam.app.constants',
      'spam.app.config',
      'spam.app.services',
      'spam.navbar',
      'spam.content',
      'spam.footer',
      'spam.401'
    ]);

})();
