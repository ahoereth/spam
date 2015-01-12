(function() {
  'use strict';

  /**
   * FILTER: spelledOutTo
   *
   * Spells the given number out when its lower than the given maximum.
   */
  angular
    .module('spam.filters')
    .filter('spelledOutTo', spelledOutToFilter);


  /* @ngInject */
  function spelledOutToFilter() {
    var numbers = [
      'one',
      'two',
      'three',
      'four',
      'five',
      'six',
      'seven',
      'eight',
      'nine',
      'ten'
    ];

    return function(input, max) {
      input = parseInt( input );
      return input <= max ? numbers[ input-1 ] || input : input;
    };
  }
})();
