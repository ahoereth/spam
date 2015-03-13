(function () {
  'use strict';

  angular
    .module('spam.directives')
    .directive('course', courseDirective);


  /* @ngInject */
  function courseDirective(User, _) {
    return {
      require: '^^field',
      restrict: 'E',
      replace: true,
      scope: {
        'course': '='
      },
      templateUrl: 'partials/directives/course.html',
      link: function(scope, elem, attrs, fieldCtrl) {
        var course = scope.course;

        scope.grade = function(force) {
          course.grade = _.formatGrade(course.grade);

          course.passed = (
            (course.grade >= 1 && course.grade <= 4) ||
            (course.passed && course.grade === course.oldGrade)
          );
          fieldCtrl.courseChange(course);

          if (course.grade === course.oldGrade && !force) { return; }
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

        scope.pass = function() {
          course.grade = ! course.grade ? course.grade : null;
          scope.grade(true);
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

        course.grade = course.oldGrade = _.formatGrade(course.grade);
        course.term_abbr = course.term + course.year;
        scope.grade();
      }
    };
  }
}());