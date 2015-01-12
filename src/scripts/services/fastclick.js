(function() {
  'use strict';

  /**
   * FastClick:
   * Removes the touch click delay introduced by mobile browsers.
   */
  angular
    .module('spam.services')
    .factory('FastClick', fastClickFactory);


    /* @ngInject */
  function fastClickFactory($window) {
    return $window.FastClick;
  }
})();
