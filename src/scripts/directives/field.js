(function () {
  'use strict';

  angular
    .module('spam.directives')
    .directive('field', fieldDirective)
    .controller('fieldController', fieldController);


  /* @ngInject */
  function fieldDirective(_) {
    return {
      restrict: 'E',
      replace: false,
      scope: {
        field: '='
      },
      transclude: true,
      templateUrl: 'partials/directives/field.html',
      controller: 'fieldController',
      link: function(scope/*, elem, attrs*/) {
        var field = scope.field;
        field.old_grade = field.grade = _.formatGrade(field.grade);
        scope.examination = !! scope.field.grade;
      }
    };
  }


  /* @ngInject */
  function fieldController($scope, User, _) {
    var self = this;
    var field = $scope.field;
    var courses = {};
    var defaultCreditSet = {
      overflowing: 0,
      percentage: 0,
      compulsory: 0,
      optional: 0,
      sum: 0
    };


    /**
     * Calculates the percantage of a number in relation the the total amount
     * of credits available in this field.
     *
     * @param  {int}
     * @return {int}
     */
    var percentage = _.partialRight(_.percent, field.field_pm+field.field_wpm);


    /**
     * Calculate the field grade either by just using the fixed grade as
     * manually defined by the user (module examination) or by calculating it
     * from the legit courses as given by the courses variable.
     */
    function calculateGrade() {
      if (field.grade) {
        return $scope.grade = field.grade;
      }

      var graded = _.chain(courses).pick(function(course) {
        return ! _.isNull(course) && _.isFinite(course.grade);
      });

      var counts = graded.pluck('counts');

      var grade = graded.pluck('grade').mapOnto(
        counts.value(), _.multiply
      ).sum().value();

      return $scope.grade = _.formatGrade(grade / counts.sum().value());
    }


    /**
     * Calculate the field data based on the courses associated with it.
     *
     * This function is debounced in order to handle multiple calls on
     * the initial pageload smoothly.
     */
    var doAnalysis = _.debounce(function() {
      var credits = field.credits = {
        passed: _.clone(defaultCreditSet),
        enrolled: _.clone(defaultCreditSet),
        full: field.field_pm + field.field_wpm
      };

      var available = credits.available = {
        compulsory: field.field_pm,
        optional: field.field_wpm
      };

      // Aggregate the credits from the individual courses.
      _(courses).pick(_.isObject).sortByAll('grade').forIn(function(course) {
        var group = course.passed ? 'passed' : 'enrolled';
        var category = course.compulsory ? 'compulsory' : 'optional';

        var availableNew = available[category] - course.credits;
        course.counts = course.credits + (availableNew < 0 ? availableNew : 0);

        available[category]     -= course.counts;
        this[group][category]   += course.counts;
        this[group].overflowing += course.credits - course.counts;
      }, credits).value();

      // Calculated the different progress values.
      _.forEach(['passed', 'enrolled', 'available'], function(group) {
        this[group].sum = this[group].compulsory + this[group].optional;
        this[group].percentage = percentage(this[group].sum);
        this[group].percentage_compulsory = percentage(this[group].compulsory);
        this[group].percentage_optional = percentage(this[group].optional);
      }, credits);

      var grade = calculateGrade();

      User.updateFieldData(field.field_id, {
        grade: grade,
        passedCredits: credits.passed.sum,
        enrolledCredits: credits.enrolled.sum,
        completed: 100 === credits.passed.percentage,
        examinationPossible: !! field.field_examination_possible
      });

      // A manual $apply call is required because of debouncing.
      $scope.$apply();
    }, 200);


    /**
     * Updates the fields courses grade cache and, if appropriate, fires
     * the average grade recalculation.
     *
     * Is loaded initially by all courses on pageload.
     *
     * @param {object}  course
     * @param {boolean} removed
     */
    self.courseChange = function(course, removed) {
      // Courses without credits are of no interest.
      if (! course.ects || course.muted || removed) {
        courses[ course.student_in_course_id ] = null;
      } else {
        courses[ course.student_in_course_id ] = {
          grade: _.isNumeric(course.grade) ? parseFloat(course.grade) : null,
          passed: course.passed,
          credits: course.ects,
          compulsory: ('PM' === course.enrolled_course_in_field_type)
        };
      }

      doAnalysis();
    };


    /**
     * Student in field grade edited. Redo some calculations and save the
     * changes to the server.
     */
    $scope.gradeChange = function() {
      $scope.grade = _.formatGrade($scope.grade);

      if ( // grade can't change if no module examination is possible.
           (! field.field_examination_possible) ||
           // Field was not passed so a module examination is not possible.
           (100 !== field.credits.passed.percentage) ||
           // Nothing to do if the grade did not actually change.
           ($scope.grade === field.old_grade)
      ) {
        $scope.grade = field.old_grade;
      }

      field.grade = field.old_grade = $scope.grade;
      field.put();
      doAnalysis();
    };


    /**
     * Method called by the UI when the 'examination' triggerable is triggered.
     */
    $scope.examine = function() {
      $scope.examination = ! $scope.examination;
      if (! $scope.examination) {
        $scope.grade = null;
        $scope.gradeChange();
      }
    };


    // Initialize the field data even if there is no course.
    doAnalysis();
  }
}());
