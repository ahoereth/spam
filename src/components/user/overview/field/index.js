import angular from 'angular';

import progress from '../../../lib/progress';
import dropdown from '../../../lib/dropdown';
import tickable from '../../../lib/tickable';
import iif from '../../../lib/iif';
import isEmpty from '../../../lib/isEmpty';
import icon from '../../../lib/icon';
import userService from '../../services/user';
import gradeInput from '../grade-input';

import controller from './UserOverviewFieldController';
import template from './field.html';


/**
 * MODULE: spam.user.overview.field
 * COMPONENT: field
 */
export default angular
  .module('spam.user.overview.field', [
    progress, tickable, iif, isEmpty, dropdown, userService, gradeInput, icon,
  ])
  .component('field', {
    template,
    controller,
    transclude: true,
    bindings: {
      raw: '=field',
    },
  })
  .name;
