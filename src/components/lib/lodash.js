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
     * Format a given string to a grade.
     *
     * Legal grades: [1.0, 1.3, 1.7, 2.0, 2.3, 2.7, 3.0, 3.3, 3.7, 4.0 5.0]
     * Everything below 1 will be formated to an empty string, everything above 5 to 5.0.
     * commas are swapped with periods, all non numerical characters are stripped.
     *
     * NOTE: This is declared outside of the mixin because of possible recursion.
     *
     * @param  {string/int/float} g a    any kind of number
     * @param  {bool}             course courses are rounded very specifically
     * @return {string}                  formatted grade
     */
    var formatGrade = function(g, course) {
      // null and NaN can be directly ignored
      if (_.isNull(g) || _.isNaN(g)) {
        return null;
      }

      course = course || false;

      // convert to string while fixing JavaScript float problem
      g = parseFloat(g).toPrecision(12);

      // replace commas with periods
      // remove everything but numbers and periods
      g = g.replace(',', '.').replace(/[^\d\.]/g, '');

      // round to one decimal behind the full stop
      if (course) {
        g = Math.round( parseFloat(g) * 10 ) / 10;
      } else {
        // field grades are by design floored (examinations office..)
        g = Math.floor( parseFloat(g) * 10 ) / 10;
      }

      // The result should be a number. If its not or if its smaller than 1 we
      // resolve to null.
      if (! _.isNumber(g) || _.isNaN(g) || g < 1) {
        return null;
      }

      // grades bigger 4 normally means failed...
      if (g > 4) {
        // grade bigger than or equal to 10? Might just be shifted to far. Shift.
        if (g >= 10) {
          return formatGrade(g / 10);

          // grades bigger than 4 are resolved to 5
        } else {
          return parseFloat('5.0').toFixed(1);
        }
      }

      // Only course grades need to be rounded more specifically. For everything
      // else we can return here.
      if (! course) {
        return g.toFixed(1);
      }

      // convert to string again
      g = g + '';

      // get digit before the period
      var a = g[0];

      // Get number behind the period
      var b = g.length > 1 ? parseInt( g[ g.length - 1 ] ) : 0;

      // format decimal place number
      if      (b <= 1          ) { b = 0; }
      else if (b >= 2 && b <= 4) { b = 3; }
      else if (b >= 5 && b <= 8) { b = 7; }
      else                       { b = 0; a++; }

      // concatenate again
      return parseFloat(a + '.' + b).toFixed(1);
    };


    /**
     * Multiplies two numbers with each other.
     *
     * @param {Number} a
     * @param {Number} b
     */
    var multiply = function(a, b) { return a * b; };


    /**
     * Sums up all elements of an array/object. Useful
     * for shorthand use in reduce functions.
     */
    var product = _.partialRight(_.reduce, multiply);


    /**
     * Creates an object with all falsey key/value pairs removed. The values
     * false, null, 0, "", undefined, and NaN are all falsey.
     *
     * @see _.compact
     * @param object: The object to compact.
     */
    var compactObject = _.partialRight(_.pick, _.identity);


    var mapOnto = function(arrA, arrB, func) {
      return _.mapValues(arrA, function(val, key) {
        return func(val, arrB[key]);
      });
    };


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
      multiply: multiply,
      product: product,
      compactObject: compactObject,
      formatGrade: formatGrade,
      percent: percent,
      isNumeric: isNumeric,
      mapOnto: mapOnto
    });

    return $window._;
  }
})();
