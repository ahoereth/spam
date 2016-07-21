(function () {
  'use strict';

  /**
   * MODULE: spam.user.index.field
   * DIRECTIVE: field
   * CONTROLLER: UserIndexFieldController
   */
  angular
    .module('spam.user.index.field', [
      'lodash',
      'progress',
      'dropdown',
      'tickable',
      'iifFilter',
      'spam.user.services.user',
      'spam.user.services.utils',
      'spam.user.index.grade-input'
    ])
    .directive('field', userIndexFieldDirective)
    .controller('UserIndexFieldController', userIndexFieldController);




  function userIndexFieldDirective() {
    return {
      restrict: 'E',
      replace: false,
      scope: {
        raw: '=field'
      },
      transclude: true,
      templateUrl: 'components/user/index/field/user.index.field.html',
      controller: 'UserIndexFieldController',
      controllerAs: 'field',
      bindToController: true
    };
  }




  /* @ngInject */
  function userIndexFieldController($scope, _, User, UserUtils) {
    var ctrl = _.assign(this, _.pick(this.raw,
      'field', 'field_id', 'field_examination_possible',
      'regulation_id', 'minimized', 'grade'
    ));
    var field = ctrl.raw;
    var courses = {};
    var defaultCreditSet = {
      overflowing: 0,
      percentage: 0,
      compulsory: 0,
      optional: 0,
      sum: 0
    };
    var foreignCreditsMem = 0;
    var hasManualGrade = false;


    /**
     * Calculates the percantage of a number in relation to the total amount
     * of credits available in this field. Capped at '100'.
     *
     * @param  {int}
     * @return {int}
     */
    var percentage = _.partialRight(_.percent,
                                    field.field_pm+field.field_wpm, true);


    /**
     * Handler for credits which flow from other fields to this field. Only
     * used by the open studies field which basically acts as a catch-all.
     */
    function handleOverflowingCredits() {
      // Omit the open studies field and sum up the credits.
      var foreignPassedCredits = _(User.getOverflowingCredits()).omit(1).sum();
      var examinationCredits = User.facts.examinationCredits;

      // Run the analysis again with those foreign credits.
      if (foreignCreditsMem !== (examinationCredits + foreignPassedCredits)) {
        foreignCreditsMem = examinationCredits + foreignPassedCredits;
        doAnalysis(foreignCreditsMem);
      }
    }


    /**
     * Calculate the field grade either by just using the fixed grade as
     * manually defined by the user (module examination) or by calculating it
     * from the legit courses as given by the courses variable.
     */
    function calculateGrade(overall) {
      overall = overall || false;

      var graded = _.chain(courses).pickBy(function(course) {
        return ! _.isNull(course) && _.isFinite(course.grade);
      });

      var credits = overall ? graded.map('credits') : graded.map('counts');
      var products = graded.map('grade').mergeWith(credits.value(), _.multiply);
      var grade = products.sum().value() / credits.sum().value();
      return UserUtils.formatGrade(grade);
    }


    /**
     * Calculate the field data based on the courses associated with it.
     *
     * This function is debounced in order to handle multiple calls on
     * the initial pageload smoothly.
     */
    var doAnalysis = function(foreignCredits) {
      foreignCredits = foreignCredits || 0;
      if (foreignCredits !== foreignCreditsMem) {
        foreignCreditsMem = foreignCredits;
      }

      var credits = ctrl.credits = {
        passed: _.clone(defaultCreditSet),
        enrolled: _.clone(defaultCreditSet),
        full: field.field_pm + field.field_wpm
      };

      var available = credits.available = {
        compulsory: field.field_pm,
        optional: field.field_wpm
      };

      // Aggregate the credits from the individual courses.
      _(courses).pickBy(_.isObject)
        .orderBy(['compulsory', 'passed', 'grade'], ['desc', 'desc', 'asc'])
        .forIn(function(course) {
          var group = course.passed ? 'passed' : 'enrolled';
          var category = course.compulsory ? 'compulsory' : 'optional';

          var freeCredits = available[category] - course.credits;
          course.counts = course.credits + (freeCredits < 0 ? freeCredits : 0);
          available[category] -= course.counts;
          credits[group][category] += course.counts;

          // If the compulsory part of the module is done, compulsory courses
          // can also flow to the optional part.
          if ('compulsory' === category && course.counts < course.credits) {
            freeCredits = available.optional - course.counts;
            var counts = course.counts + (freeCredits < 0 ? freeCredits : 0);
            available.optional -= counts;
            credits[group].optional += counts;
            course.counts = course.counts + counts;
          }

          // Overflowing credits can flow to the open studies module.
          credits[group].overflowing += (course.credits - course.counts);
      });

      // Account for foreign credits, if any.
      if (foreignCredits) {
        var availableNew = available.optional - foreignCredits;
        var counts = foreignCredits + (availableNew < 0 ? availableNew : 0);
        credits.foreign = foreignCredits;
        available.optional -= counts;
        credits.passed.optional += counts;
        credits.passed.overflowing += (foreignCredits - counts);
      }

      // Calculated the different progress values.
      _.forEach(['passed', 'enrolled', 'available'], function(group) {
        credits[group].sum = credits[group].compulsory + credits[group].optional;
        credits[group].percentage = percentage(credits[group].sum);
        credits[group].percentage_compulsory = percentage(credits[group].compulsory);
        credits[group].percentage_optional = percentage(credits[group].optional);
      });

      // An examination is only possible with enough credits.
      ctrl.examination = (100 >= credits.passed.percentage) ? hasManualGrade
                                                            : false;

      // Only update the field's grade and update the user facts if the credits
      // do not include foreign credits. Foreign credit updates are always
      // called after the calculations already ran beforehand.
      if (!foreignCredits) {
        // Grade can be the average or manually defined.
        ctrl.grade = hasManualGrade ? UserUtils.formatGrade(field.grade)
                                    : calculateGrade();

        User.updateFieldData(field.field_id, {
          grade: ctrl.grade,
          overallGrade: calculateGrade(true),
          passedCredits: credits.passed.sum,
          overallPassedCredits: credits.passed.sum + credits.passed.overflowing,
          overflowPassedCredits: credits.passed.overflowing,
          enrolledCredits: credits.enrolled.sum,
          completed: 100 === credits.passed.percentage,
          examinationPossible: !! field.field_examination_possible,
          examination: ctrl.examination
        });
      } else {
        $scope.$digest();
      }
    };


    /**
     * Updates the fields courses grade cache and, if appropriate, fires
     * the average grade recalculation.
     *
     * Is loaded initially by all courses on pageload.
     *
     * @param {object}  course
     * @param {boolean} removed
     */
    ctrl.courseChange = function(course, removed) {
      // Courses without credits are of no interest.
      if (! course.ects || course.muted || course.failed || removed) {
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
    ctrl.gradeChange = function(newGrade, examine) {
      newGrade = newGrade || null;

      if (
        // Grade can't change if no module examination is possible.
        (field.field_examination_possible) &&
        // Field was not passed so a module examination is not possible.
        (100 === ctrl.credits.passed.percentage)
      ) {
        hasManualGrade = !_.isUndefined(examine) ? examine : hasManualGrade;
        if (newGrade !== (field.grade||null)) {
          hasManualGrade = newGrade !== null;
          field.grade = newGrade;
          field.put();
        }
      }

      doAnalysis();
    };


    /**
     * Update field minimization setting.
     */
    ctrl.minimize = function() {
      field.minimized = ctrl.minimized;
      field.put();
    };


    // If this field is the open studies field add a watcher which is being
    // called when the user facts have been updated in order to handle
    // credits flowing from other fields to this field.
    if (1 === field.field_id) {
      User.addWatcher(handleOverflowingCredits);
    }

    // Initialize the field data. In general this function will be called
    // from individual courses on data changes.
    hasManualGrade = !!field.grade;
    ctrl.examination = hasManualGrade;
    doAnalysis();
  }

})();
