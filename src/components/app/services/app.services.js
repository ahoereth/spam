(function() {
  'use strict';

  /**
   * MODULE: spam.components.app.services
   */
  angular
    .module('spam.components.app.services', [
      'spam.components.app.services.routes',
      'spam.components.app.services.http-intercept'
    ]);

})();
