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
      controller: fieldCtrl,
      link: fieldLink
    };
  }


  /* @ngInject */
  function fieldCtrl($scope, User, _) {
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

    var percentage = _.partialRight(_.percent, field.field_pm+field.field_wpm);

    function calculateGrade() {
      if (field.grade) {
        return $scope.grade = field.grade;
      }

      var graded = _.chain(courses).pick(function(course) {
        return _.isFinite(course.grade);
      });

      var counts = graded.pluck('counts');

      var grade = graded.pluck('grade').mapOnto(
        counts.value(), _.multiply
      ).sum().value();

      return $scope.grade = _.formatGrade(grade / counts.sum().value());
    }

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

      _(courses).sortByAll('grade').forIn(function(course) {
        var group = course.passed ? 'passed' : 'enrolled';
        var category = course.compulsory ? 'compulsory' : 'optional';

        var availableNew = available[category] - course.credits;
        course.counts = course.credits + (availableNew < 0 ? availableNew : 0);

        available[category]     -= course.counts;
        this[group][category]   += course.counts;
        this[group].overflowing += course.credits - course.counts;
      }, credits).value();

      _.forEach(['passed', 'enrolled', 'available'], function(group) {
        this[group].sum = this[group].compulsory + this[group].optional;
        this[group].percentage = percentage(this[group].sum);
      }, credits);

      available.percentage_compulsory = percentage(available.compulsory);
      available.percentage_optional = percentage(available.optional);

      var grade = calculateGrade();

      User.updateFieldData(field.field_id, {
        grade: grade,
        passedCredits: credits.passed.sum,
        completed: 0 === credits.available.sum,
        examinationPossible: !! field.field_examination_possible
      });

      $scope.$apply(); // required by debouncing
    }, 200);

    /**
     * Updates the fields courses grade cache and, if appropriate, fires
     * the average grade recalculation.
     *
     * Is loaded by all courses on pageload initially.
     */
    self.courseGradeChange = function(course) {
      // Courses without credits are of no interest.
      if (! course.ects) { return; }

      courses[ course.student_in_course_id ] = {
        grade: _.isNumeric(course.grade) ? parseFloat(course.grade) : null,
        passed: course.passed,
        credits: course.ects,
        compulsory: ('PM' === course.enrolled_course_in_field_type)
      };

      doAnalysis();
    };


    /**
     * Student in field grade edited. Redo some calculations and save the
     * changes to the server.
     */
    $scope.gradeChange = function() {
      this.grade = _.formatGrade(this.grade);

      if ( // grade can't change if no module examination is possible.
           (! field.field_examination_possible) ||
           // Field was not passed so a module examination is not possible.
           (100 !== field.credits.passed.percentage) ||
           // Nothing to do if the grade did not actually change.
           (this.grade === field.old_grade)
      ) {
        this.grade = field.old_grade;
      }

      field.grade = field.old_grade = this.grade;
      field.put();
      doAnalysis();
    };
  }


  function fieldLink(scope/*, elem, attrs*/) {
    var field = scope.field;
    field.old_grade = field.grade = _.formatGrade(field.grade);
  }

}());
