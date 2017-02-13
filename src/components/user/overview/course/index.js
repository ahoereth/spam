import angular from 'angular';
import { pick } from 'lodash-es';

import blurOnEnter from '../../../lib/blur-on-enter';
import dropdown from '../../../lib/dropdown';
import tickable from '../../../lib/tickable';
import tooltips from '../../../lib/tooltips';
import icon from '../../../lib/icon';
import userService from '../../services/user';
import field from '../field';
import gradeInput from '../grade-input';
import formatGrade from '../../formatGrade';

import template from './course.html';


const courseDirective = ['User', User => ({
  template,
  require: '^^field',
  restrict: 'E',
  replace: true,
  scope: {
    course: '=',
  },
  link: function courseDirectiveLink(scope, elem, attrs, fieldCtrl) {
    const course = scope.course;

    scope.grade = newGrade => {
      course.grade = formatGrade(newGrade);
      course.passed = (
        (course.grade >= 1 && course.grade <= 4) ||
        (course.passed && course.grade === course.oldGrade)
      );
      course.failed = !course.passed && course.grade >= 5;
      fieldCtrl.courseChange(course);

      if (
        (course.grade !== course.oldGrade) ||
        (course.passed && !course.grade)
      ) {
        course.muted = course.muted && !course.grade;
        course.oldGrade = course.grade;
        course.customPUT({
          grade: course.grade,
          passed: course.passed,
          muted: course.muted,
        });
      }
    };

    scope.mute = () => {
      fieldCtrl.courseChange(course);
      course.customPUT({
        muted: course.muted,
      });
    };

    scope.remove = () => {
      course.muted = true;
      fieldCtrl.courseChange(course);
      User.removeCourse(course);
    };

    scope.move = fieldId => {
      course.enrolled_field_id = fieldId;
      course.customPUT(pick(course, 'enrolled_field_id'));
      fieldCtrl.courseChange(course, true);
    };

    course.term_abbr = course.term + course.year;
    course.oldGrade = formatGrade(course.grade);
    scope.grade(course.grade);
  },
})];


/**
 * MODULE: spam.user.overview.course
 * DIRECTIVE: course
 */
export default angular
  .module('spam.user.overview.course', [
    blurOnEnter, dropdown, tickable, tooltips, userService, field, gradeInput,
    icon,
  ])
  .directive('course', courseDirective)
  .name;
