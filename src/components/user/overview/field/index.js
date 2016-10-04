import angular from 'angular';

import progress from '../../../lib/progress';
import dropdown from '../../../lib/dropdown';
import tickable from '../../../lib/tickable';
import iif from '../../../lib/iif';
import userService from '../../services/user';
import gradeInput from '../grade-input';
import UserOverviewFieldController from './UserOverviewFieldController';


/**
 * MODULE: spam.user.overview.field
 * DIRECTIVE: field
 * CONTROLLER: UserIndexFieldController
 */
export default angular
  .module('spam.user.overview.field', [
    progress, tickable, iif, dropdown, userService, gradeInput
  ])
  .controller('UserOverviewFieldController', UserOverviewFieldController)
  .directive('field', userOverviewFieldDirective)
  .name;




function userOverviewFieldDirective() {
  return {
    restrict: 'E',
    replace: false,
    scope: {
      raw: '=field'
    },
    transclude: true,
    templateUrl: 'components/user/overview/field/field.html',
    controller: 'UserOverviewFieldController',
    controllerAs: 'field',
    bindToController: true
  };
}
