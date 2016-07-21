(function() {
  'use strict';

  /**
   * MODULE: lodash
   * SERVICE: _
   */
  angular
    .module('lodash', [])
    .factory('_', lodashFactory);




  /* @ngInject */
  function lodashFactory($window) {
    var _ = $window._;


    /**
     * Creates an object with all falsey key/value pairs removed. The values
     * false, null, 0, "", undefined, and NaN are all falsey.
     *
     * @see _.compact
     * @param object: The object to compact.
     */
    var compactObject = _.partialRight(_.pickBy, _.identity);


    /**
     * Calculates the percentage ratio of two given numbers.
     *
     * @param  {number} a
     * @param  {number} b
     * @param  {bool}   cap
     * @return {number}
     */
    var percent = function(a, b, cap) {
      return cap && (a / b) > 1 ? 100 : (a / b * 100);
    };


    /**
     * Checks if a given variable contains a number - lodash's similar functions
     * don't handle strings etc.
     *
     * @see  http://stackoverflow.com/a/1830844/1447384
     * @param  {any}     n variable to check
     * @return {Boolean}
     */
    var isNumeric = function(n) {
      return ! isNaN(parseFloat(n)) && isFinite(n);
    };


    _.mixin({
      compactObject: compactObject,
      percent: percent,
      isNumeric: isNumeric
    });

    return $window._;
  }

})();
