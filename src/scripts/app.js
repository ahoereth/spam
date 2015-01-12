(function() {
  'use strict';

  angular.module('spam', [
    'ngRoute',
    'ngSanitize',

    'restangular',
    'ui.bootstrap',
    'ab-base64',

    'spam.filters',
    'spam.services',
    'spam.directives',
    'spam.controllers',
    'spam.controllers.user',
    'spam.controllers.courses'
  ]);

})();
