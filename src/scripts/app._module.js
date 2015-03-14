(function() {
  'use strict';

  angular.module('spam', [
    'ngRoute',
    'ngSanitize',

    'restangular',
    '720kb.tooltips',
    'unicorn-directive',

    'progressbar',
    'blurOnEnter',
    'dropdown',
    'infiniteScroll',
    'tickable',
    'instafocus',
    'mgcrea.ngStrap.button',

    'spam.filters',
    'spam.services',
    'spam.directives',
    'spam.controllers',
    'spam.controllers.user',
    'spam.controllers.courses'
  ]);
})();
