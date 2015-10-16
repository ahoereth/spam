(function() {
  'use strict';

  angular.module('spam', [
    'ngSanitize',
    'lodash',
    'restangular',
    '720kb.tooltips',
    'unicorn-directive',

    'spam.components.app',
    'spam.components.landing'
  ]);
})();
