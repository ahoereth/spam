import angular from 'angular';

import filters from './filters';
import services from './services';
import list from './list';
import single from './single';
import row from './row';
import addRemove from './add-remove';


/**
 * MODULE: spam.courses
 */
export default angular
  .module('spam.courses', [filters, services, list, single, row, addRemove])
  .name;
