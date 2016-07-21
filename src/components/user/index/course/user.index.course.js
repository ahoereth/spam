(function () {
  'use strict';

  /**
   * MODULE: spam.user.index.course
   * DIRECTIVE: course
   */
  angular
    .module('spam.user.index.course', [
      'lodash',
      'blurOnEnter',
      'dropdown',
      'tickable',
      '720kb.tooltips',
      'spam.user.services.user',
      'spam.user.services.utils',
      'spam.user.index.field',
      'spam.user.index.grade-input'
    ])
    .directive('course', courseDirective);




  /* @ngInject */
  function courseDirective(_, User, UserUtils) {
    return {
      require: '^^field',
      restrict: 'E',
      replace: true,
      scope: {
        'course': '='
      },
      templateUrl: 'components/user/index/course/user.index.course.html',
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
          course.customPUT(_.pick(course, 'enrolled_field_id'));
          fieldCtrl.courseChange(course, true);
        };

        course.term_abbr = course.term + course.year;
        course.oldGrade = UserUtils.formatGrade(course.grade);
        scope.grade(course.grade);
      }
    };
  }

}());
