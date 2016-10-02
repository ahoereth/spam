import angular from 'angular';
import { pick } from 'lodash-es';

import blurOnEnter from '../../../lib/blur-on-enter';
import dropdown from '../../../lib/dropdown';
import tickable from '../../../lib/tickable';
import tooltips from '../../../lib/tooltips';
import userService from '../../services/user';
import utilsService from '../../services/utils';
import field from '../field';
import gradeInput from '../grade-input';


/**
 * MODULE: spam.user.overview.course
 * DIRECTIVE: course
 */
export default angular
  .module('spam.user.overview.course', [
    blurOnEnter,
    dropdown,
    tickable,
    tooltips,
    userService,
    utilsService,
    field,
    gradeInput
  ])
  .directive('course', courseDirective)
  .name;




/* @ngInject */
function courseDirective(User, UserUtils) {
  return {
    require: '^^field',
    restrict: 'E',
    replace: true,
    scope: {
      'course': '='
    },
    templateUrl: 'components/user/overview/course/course.html',
    link: function(scope, elem, attrs, fieldCtrl) {
      var course = scope.course;

      scope.grade = function(newGrade) {
        course.grade = UserUtils.formatGrade(newGrade);

        course.passed = (
          (course.grade >= 1 && course.grade <= 4) ||
          (course.passed && course.grade === course.oldGrade)
        );
        course.failed = !course.passed && 5 <= course.grade;
        fieldCtrl.courseChange(course);

        if (course.grade === course.oldGrade) { return; }
        course.oldGrade = course.grade;
        course.customPUT({
          grade: course.grade,
          passed: course.passed
        });
      };

      scope.mute = function() {
        fieldCtrl.courseChange(course);
        course.customPUT({
          muted: course.muted
        });
      };

      scope.remove = function() {
        course.muted = true;
        fieldCtrl.courseChange(course);
        User.removeCourse(course);
      };

      scope.move = function(fieldId) {
        course.enrolled_field_id = fieldId;
        course.customPUT(pick(course, 'enrolled_field_id'));
        fieldCtrl.courseChange(course, true);
      };

      course.term_abbr = course.term + course.year;
      course.oldGrade = UserUtils.formatGrade(course.grade);
      scope.grade(course.grade);
    }
  };
}
