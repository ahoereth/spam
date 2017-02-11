import angular from 'angular';
import { isEmpty } from 'lodash-es';


function isEmptyFilter() {
  return isEmpty;
}


/**
 * MODULE: isEmptyFilter
 * FILTER: isEmpty
 */
export default angular
  .module('isEmptyFilter', [])
  .filter('isEmpty', isEmptyFilter)
  .name;
