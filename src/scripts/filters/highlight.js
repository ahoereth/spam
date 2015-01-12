(function() {
  'use strict';

  /**
   * FILTER: highlight
   *
   * Given a needle hightlights it (using <strong>) in the haystack.
   */
  angular
    .module('spam.filters')
    .filter('highlight', highlightFilter);


  /* @ngInject */
  function highlightFilter() {
    return function (haystack, needle) {
      if (! haystack || ! needle) { return haystack; }

      // remove all reserved characters from the needle
      needle = needle.toString().replace(/[\[\]\/\{\}\(\)\*\+\?\.\\\^\$|]/g, '\\$&'); // but -

      // treat '-', '_' and ' ' as equal
      needle = needle.replace(/[-_ ]/g, '[_-\\s]');

      return haystack.replace( new RegExp(needle, 'gi'), '<strong>$&</strong>' );
    };
  }
})();
