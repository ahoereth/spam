(function() {
  'use strict';

  /**
   * MODULE: spam.app
   */
  angular
    .module('spam.app', [
      'spam.app.config',
      'spam.app.constants',
      'spam.app.services',
      'spam.app.title',
      'spam.navbar',
      'spam.content',
      'spam.footer',
      'spam.401'
    ]);

})();
