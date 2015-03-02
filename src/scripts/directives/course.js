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
      controller: courseCtrl,
      link: function(scope, elem, attrs, fieldCtrl) {
        var course = scope.course;

        scope.changeGrade = function() {
          this.course.grade = _.formatGrade(this.course.grade);
          course.passed = (
            (course.grade >= 1 && course.grade <= 4) ||
            (course.passed && course.grade === course.old_grade)
          );
          course.old_grade = course.grade;
          fieldCtrl.courseGradeChange(this.course);
        };

        scope.changeMuted = function() {
        };

        scope.remove = function() {
          User.removeCourse(this.course);
        };

        course.old_grade = course.grade || null;
        course.term_abbr = course.term + course.year;
        scope.changeGrade();
      }
    };
  }


  /* @ngInject */
  function courseCtrl($scope, $timeout) {
  }
}());
