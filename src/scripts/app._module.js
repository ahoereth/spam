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

    'spam.components.navbar',
    'spam.components.landing',
    'spam.components.courses',
    'spam.components.guide',
    'spam.components.user',
    'spam.components.help',
    'spam.components.notifications',
    'spam.components.common'
  ]);
})();
