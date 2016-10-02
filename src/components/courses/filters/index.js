import angular from 'angular';

import course from './course';
import prerequisites from './prerequisites';


/**
 * MODULE: spam.courses.filters
 */
export default angular
  .module('spam.courses.filters', [course, prerequisites])
  .name;
