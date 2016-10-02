import angular from 'angular';
import { isNull, isNaN, isNumber } from 'lodash-es';


/**
 * MODULE: spam.user.services.utils
 * SERVICE: UserUtils
 */
export default angular
  .module('spam.user.services.utils', [])
  .factory('UserUtils', userUtilsFactory)
  .name;




/* @ngInject */
function userUtilsFactory() {

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
  function formatGrade(g, course) {
    // null and NaN can be directly ignored
    if (isNull(g) || isNaN(g)) {
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
    if (! isNumber(g) || isNaN(g) || g < 1) {
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


  return {
    formatGrade: formatGrade
  };
}
