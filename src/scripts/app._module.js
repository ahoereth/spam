(function() {
  'use strict';

  angular.module('spam', [
    'ngRoute',
    'ngSanitize',

    'restangular',
    '720kb.tooltips',
    'unicorn-directive',

    'dropdown',
    'progressbar',

    'spam.filters',
    'spam.services',
    'spam.directives',
    'spam.controllers',
    'spam.controllers.user',
    'spam.controllers.courses'
  ]);
})();
