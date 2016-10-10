import angular from 'angular';


import sortable from '../../../lib/sortable';
import userService from '../../services/user';
import field from '../field';
import course from '../course';

import controller from './UserOverviewColumnsController';
import template from './columns.html';
import factory from './columns-factory';
import './columns.less';


/**
 * MODULE: spam.user.overview.columns
 * COMPONENT: overviewColumns
 * FACTORY: UserOverviewColumns
 */
export default angular
  .module('spam.user.overview.columns', [sortable, userService, field, course])
  .component('overviewColumns', {
    template,
    controller,
    bindings: {
      fields: '=',
      courses: '=',
    },
  })
  .factory('UserOverviewColumns', factory)
  .name;
