(function() {
  'use strict';

  /**
   * MODULE: highlightFilter
   * FILTER: highlight
   *
   * Hightlights the given needle (using <strong>) in the haystack.
   */
  angular
    .module('highlightFilter', [])
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
