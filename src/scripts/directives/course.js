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
        var c = scope.course;

        scope.changeGrade = function() {
          this.course.grade = _.formatGrade(this.course.grade);
          fieldCtrl.courseGradeChange(this.course);
        };

        scope.changePassed = function() {};

        scope.remove = function() {
          User.removeCourse(this.course);
        };

        c.grade = _.formatGrade(c.grade, true);
        c.old_grade = c.grade; // remember old grade
        c.term_abbr = c.term + c.year;

        // TODO: clean this if up
        if (c.grade !== c.old_grade && (c.grade < 1 || c.grade > 4)) {
          c.passed = false;
        } else {
          c.passed = (c.passed || (c.grade >= 1 && c.grade <= 4)) ? true : false;
        }
      }
    };
  }


  /* @ngInject */
  function courseCtrl($scope, $timeout) {

    /**
     * Blur the grade input field when the user presses the enter key.
     */
    $scope.blurOnEnter = function($event) {
      if ($event.keyCode !== 13) { return; }
      $timeout(function () { // timeout hack..
        $event.target.blur();
      }, 0, false);
    };
  }
}());
