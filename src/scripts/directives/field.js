(function () {
  'use strict';

  angular
    .module('spam.directives')
    .directive('field', fieldDirective);


  /* @ngInject */
  function fieldDirective() {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        field: '='
      },
      transclude: true,
      templateUrl: 'partials/directives/field.html',
      /* @ngInject */
      controller: fieldCtrl
    //  link: function(scope, elem, attrs) {}
    };
  }


  /* @ngInject */
  function fieldCtrl($scope, _) {
    var self = this;
    var field = $scope.field;
    var grades = {}, credits = {};

    /**
     * Calculates the courses average grade.
     */
    var calculateGrade = _.debounce(function() {
      var opencredits = field.field_pm + field.field_wpm;
      var g = _.pick(grades, _.isFinite);
      var c = _.pick(credits, _.keys(g));
      g = _.mapValues(g, function(val, key) {
        opencredits -= c[key];
        c[key] = opencredits < 0 ? c[key] + opencredits : c[key];
        c[key] = c[key] < 0 ? 0 : c[key];
        return val * c[key];
      });

      $scope.grade = _.formatGrade(_.sum(g) / _.sum(c));
      $scope.$apply();
    }, 200);

    /**
     * Updates the fields courses grade cache and, if appropriate, fires
     * the average grade recalculation.
     */
    self.courseGradeChange = function(course) {
      grades[ course.student_in_course_id ] = _.isNumeric(course.grade) ?
        parseFloat(course.grade) : null;

      credits[ course.student_in_course_id ] = course.ects;
      calculateGrade();
    };


    // Initialize the grade cache.
    _.forIn(field.courses, function(course) {
      this.courseGradeChange(course);
    }, self);
  }

}());
