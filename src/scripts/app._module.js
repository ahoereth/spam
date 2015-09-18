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
    'contenteditable',
    'inlineSelectables',
    'mgcrea.ngStrap.button',

    'spam.filters',
    'spam.services',
    'spam.controllers',
    'spam.controllers.courses',

    'spam.components.navbar',
    'spam.components.user',
    'spam.components.help',
    'spam.components.notifications',
    'spam.components.common'
  ]);
})();
