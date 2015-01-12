(function() {
  'use strict';

  /**
   * FILTER: nl2br
   *
   * Converts all line breaks to actual html break line tags.
   */
  angular
    .module('spam.filters')
    .filter('nl2br', nl2brFilter);


  /* @ngInject */
  function nl2brFilter() {
    return function(text) {
      return text.replace(/\n/g, '<br>');
    };
  }
})();
