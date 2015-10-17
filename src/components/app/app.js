(function() {
  'use strict';

  /**
   * MODULE: spam.components.app
   */
  angular
    .module('spam.components.app', [
      'spam.components.app.run',
      'spam.components.app.constants',
      'spam.components.app.config',
      'spam.components.app.services',
      'spam.components.navbar',
      'spam.components.content',
      'spam.components.footer',
      'spam.components.401'
    ]);

})();
