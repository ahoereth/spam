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
          fieldCtrl.courseGradeChange(this.course);

          if (course.grade === course.oldGrade && !force) { return; }
          course.oldGrade = course.grade;
          course.put();
        };

        scope.mute = function() {};

        scope.pass = function() {
          course.grade = ! course.grade ? course.grade : null;
          scope.grade(true);
        };

        scope.remove = function() {
          User.removeCourse(this.course);
        };

        scope.move = function(fieldId) {
          User.moveCourse(course.student_in_course_id, fieldId);
        };

        course.grade = course.oldGrade = _.formatGrade(course.grade);
        course.term_abbr = course.term + course.year;
        scope.grade();
      }
    };
  }
}());
