import angular from 'angular';

import progress from '../../../lib/progress';
import dropdown from '../../../lib/dropdown';
import tickable from '../../../lib/tickable';
import iif from '../../../lib/iif';
import userService from '../../services/user';
import gradeInput from '../grade-input';

import controller from './UserOverviewFieldController';
import template from './field.html';


/**
 * MODULE: spam.user.overview.field
 * DIRECTIVE: field
 */
export default angular
  .module('spam.user.overview.field', [
    progress, tickable, iif, dropdown, userService, gradeInput,
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
