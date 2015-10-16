(function() {
  'use strict';

  /**
   * MODULE: nl2brFilter
   * FILTER: nl2br
   *
   * Converts all line breaks to actual html break tags.
   */
  angular
    .module('nl2brFilter', [])
    .filter('nl2br', nl2brFilter);




  /* @ngInject */
  function nl2brFilter() {
    return function(text) {
      return text.replace(/\n/g, '<br>');
    };
  }

})();
