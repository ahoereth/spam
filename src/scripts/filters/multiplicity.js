(function() {
  'use strict';

  /**
   * FILTER: multiplicity
   *
   * Similar to iif filter but used for multiplicity treatment of text.
   */
  angular
    .module('spam.filters')
    .filter('multiplicity', multiplicityFilter);


  /* @ngInject */
  function multiplicityFilter() {
    return function(input, singular, plural) {
      return (input === 1) ? singular : plural;
    };
  }
})();
