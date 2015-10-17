(function() {
  'use strict';

  /**
   * MODULE: spam.app.services
   */
  angular
    .module('spam.app.services', [
      'spam.app.services.routes',
      'spam.app.services.http-intercept'
    ]);

})();
