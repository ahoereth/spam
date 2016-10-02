import angular from 'angular';
import { forEach, get } from 'lodash-es';

import iif from '../../lib/iif';
import tooltips from '../../lib/tooltips';
import restangular from '../../lib/restangular';
import routes from '../../app/services/routes';
import userService from '../services/user';
import columns from './columns';
import thesisInput from './thesis-input';
import gradeInput from './grade-input';
import matriculationSetter from '../settings/matriculation-setter';

// import 'overview.less';


/**
 * MODULE: spam.user.overview
 * ROUTE: /~
 * CONTROLLER: UserIndexController
 */
export default angular
  .module('spam.user.overview', [
    restangular,
    tooltips,
    iif,
    routes,
    userService,
    columns,
    thesisInput,
    gradeInput,
    matriculationSetter
  ])
  .config(userIndexRouting)
  .controller('UserIndexController', userIndexController)
  .name;




/* @ngInject */
function userIndexRouting(RoutesProvider) {
  RoutesProvider.add('/~', {
    controller: 'UserIndexController',
    controllerAs: 'overview',
    templateUrl: 'components/user/overview/overview.html',
    title: ':username',
    reloadOnSearch: false,
    access: 1
  });
}




/* @ngInject */
function userIndexController(
  $scope,
  Restangular,
  User,
  UserIndexColumns
) {
  var ctrl = this;

  /**
   * Forces a local $scope.$apply - used in cases where changes occur out
   * of the regular cycle.
   */
  function scopeApply() {
    $scope.$apply();
  }


  /**
   * Function to give the user a headstart and add the guide courses for his
   * first semester to his personal overview.
   */
   ctrl.headstart = function() {
    Restangular.one('guides', 1).getList('courses', {
      semester: 1,
      year    : User.details.mat_year,
      term    : User.details.mat_term
    }).then(function(guide) {
      forEach(guide, function(course) {
        var field_id = !! course.singleField ? course.singleField :
          get(course, 'fields[0].field_id', null);
        User.addCourse(course, field_id);
      });
    });
  };


  // Forces a $scope.$apply when relevant user data changes out-of-cycle.
  User.addWatcher(scopeApply);


  // Initialize local scope data.
  ctrl.user    = User.details;
  ctrl.facts   = User.facts;
  ctrl.fields  = User.fields;
  ctrl.courses = User.courses;
  ctrl.thesisinput = !!(User.details.thesis_title ||
                        User.details.thesis_grade);
}
