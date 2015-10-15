(function() {
  'use strict';

  angular.module('spam', [
    'ngSanitize',

    'restangular',
    '720kb.tooltips',
    'unicorn-directive',

    'progress',
    'blurOnEnter',
    'dropdown',
    'infiniteScroll',
    'tickable',
    'instafocus',
    'contenteditable',
    'inlineSelectables',
    'mgcrea.ngStrap.button',

    'spam.filters',

    'spam.components.app',
    'spam.components.navbar',
    'spam.components.landing',
    'spam.components.courses',
    'spam.components.guide',
    'spam.components.user',
    'spam.components.admin',
    'spam.components.help',
    'spam.components.notifications',
    'spam.components.common'
  ]);
})();
