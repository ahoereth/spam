import {
  omit, sum, forIn, orderBy, pickBy, isPlainObject, partialRight, pick, assign,
  isNull, isFinite, map, mergeWith, multiply, clone, forEach, isUndefined,
} from 'lodash-es';
import formatGrade from '../../formatGrade';

function isNumeric(x) {
  return !(isNaN(x)) && (typeof x !== 'object') &&
    (x !== Number.POSITIVE_INFINITY) && (x !== Number.NEGATIVE_INFINITY);
}

const percent = (a, b) => ((a / b) > 1 ? 100 : ((a / b) * 100));


const defaultCreditSet = {
  overflowing: 0, percentage: 0, compulsory: 0, optional: 0, sum: 0,
};


/**
 * Calculate the field grade either by just using the fixed grade as
 * manually defined by the user (module examination) or by calculating it
 * from the legit courses as given by the courses variable.
 */
function calculateGrade(courses, overall = false) {
  const graded = pickBy(courses, c => !isNull(c) && isFinite(c.grade));
  const credits = overall ? map(graded, 'credits') : map(graded, 'counts');
  const products = mergeWith(map(graded, 'grade'), credits, multiply);
  const grade = sum(products) / sum(credits);
  return formatGrade(grade);
}


export default class UserOverviewFieldController {
  static $inject = ['$scope', 'User'];

  constructor($scope, User) {
    assign(this, pick(this.raw, [
      'field', 'field_id', 'field_examination_possible',
      'regulation_id', 'minimized', 'grade',
    ]), {
      $scope, User,
      courses: this.courses || {},
      foreignCreditsMem: 0,
      hasManualGrade: false,
    });
    const field = this.raw;

    /**
     * Handler for credits which flow from other fields to this field. Only
     * used by the open studies field which basically acts as a catch-all.
     */
    function handleOverflowingCredits() {
      // Omit the open studies field and sum up the credits.
      const foreignPassedCredits = sum(omit(User.getOverflowingCredits(), 1));
      const examinationCredits = User.facts.examinationCredits;

      // Run the analysis again with those foreign credits.
      if (this.foreignCreditsMem !== (examinationCredits + foreignPassedCredits)) {
        this.foreignCreditsMem = examinationCredits + foreignPassedCredits;
        this.doAnalysis(this.foreignCreditsMem);
      }
    }

    // If this field is the open studies field add a watcher which is being
    // called when the user facts have been updated in order to handle
    // credits flowing from other fields to this field.
    if (field.field_id === 1) {
      this.User.addWatcher(handleOverflowingCredits);
    }

    // Initialize the field data. In general this function will be called
    // from individual courses on data changes.
    this.hasManualGrade = !!field.grade;
    this.examination = this.hasManualGrade;
    this.doAnalysis();
  }


  /**
   * Calculate the field data based on the courses associated with it.
   *
   * This function is debounced in order to handle multiple calls on
   * the initial pageload smoothly.
   */
  doAnalysis(foreignCredits) {
    const field = this.raw;

    foreignCredits = foreignCredits || 0;
    if (foreignCredits !== this.foreignCreditsMem) {
      this.foreignCreditsMem = foreignCredits;
    }

    const percentage = partialRight(percent, field.field_pm + field.field_wpm);

    this.credits = {
      passed: clone(defaultCreditSet),
      enrolled: clone(defaultCreditSet),
      full: field.field_pm + field.field_wpm,
    };
    const credits = this.credits;

    credits.available = {
      compulsory: field.field_pm,
      optional: field.field_wpm,
    };
    const available = credits.available;

    // Aggregate the credits from the individual courses.
    forIn(
      orderBy(
        pickBy(this.courses, isPlainObject),
        ['compulsory', 'passed', 'grade'], ['desc', 'desc', 'asc'],
      ),
      course => {
        const group = course.passed ? 'passed' : 'enrolled';
        const category = course.compulsory ? 'compulsory' : 'optional';

        let freeCredits = available[category] - course.credits;
        course.counts = course.credits + (freeCredits < 0 ? freeCredits : 0);
        available[category] -= course.counts;
        credits[group][category] += course.counts;

        // If the compulsory part of the module is done, compulsory courses
        // can also flow to the optional part.
        if (category === 'compulsory' && course.counts < course.credits) {
          freeCredits = available.optional - course.counts;
          const counts = course.counts + (freeCredits < 0 ? freeCredits : 0);
          available.optional -= counts;
          credits[group].optional += counts;
          course.counts += counts;
        }

        // Overflowing credits can flow to the open studies module.
        credits[group].overflowing += (course.credits - course.counts);
      },
    );

    // Account for foreign credits, if any.
    if (foreignCredits) {
      const availableNew = available.optional - foreignCredits;
      const counts = foreignCredits + (availableNew < 0 ? availableNew : 0);
      credits.foreign = foreignCredits;
      available.optional -= counts;
      credits.passed.optional += counts;
      credits.passed.overflowing += (foreignCredits - counts);
    }

    // Calculated the different progress values.
    forEach(['passed', 'enrolled', 'available'], group => {
      credits[group].sum = credits[group].compulsory + credits[group].optional;
      credits[group].percentage = percentage(credits[group].sum);
      credits[group].percentage_compulsory = percentage(credits[group].compulsory);
      credits[group].percentage_optional = percentage(credits[group].optional);
    });

    // An examination is only possible with enough credits.
    this.examination = (credits.passed.percentage === 100) ? this.hasManualGrade
                                                           : false;

    // Only update the field's grade and update the user facts if the credits
    // do not include foreign credits. Foreign credit updates are always
    // called after the calculations already ran beforehand.
    if (!foreignCredits) {
      // Grade can be the average or manually defined.
      this.grade = this.hasManualGrade ? formatGrade(field.grade)
                                       : calculateGrade(this.courses);

      this.User.updateFieldData(field.field_id, {
        grade: this.grade || calculateGrade(this.courses),
        overallGrade: calculateGrade(this.courses, true),
        passedCredits: credits.passed.sum,
        overallPassedCredits: credits.passed.sum + credits.passed.overflowing,
        overflowPassedCredits: credits.passed.overflowing,
        enrolledCredits: credits.enrolled.sum,
        completed: credits.passed.percentage === 100,
        examinationPossible: !!field.field_examination_possible,
        examination: this.examination,
      });
    } else {
      this.$scope.$digest();
    }
  }


  /**
   * Updates the fields courses grade cache and, if appropriate, fires
   * the average grade recalculation.
   *
   * Is loaded initially by all courses on pageload.
   *
   * @param {object}  course
   * @param {boolean} removed
   */
  courseChange(course, removed) {
    // Courses without credits are of no interest.
    if (!course.ects || course.muted || course.failed || removed) {
      this.courses[course.student_in_course_id] = null;
    } else {
      this.courses[course.student_in_course_id] = {
        grade: isNumeric(course.grade) ? parseFloat(course.grade) : null,
        passed: course.passed,
        credits: course.ects,
        compulsory: course.enrolled_course_in_field_type === 'PM',
      };
    }

    this.doAnalysis();
  }


  /**
   * Student in field grade edited. Redo some calculations and save the
   * changes to the server.
   */
  gradeChange(newGrade, examine) {
    newGrade = newGrade || null;

    if (
      // Grade can't change if no module examination is possible.
      (this.raw.field_examination_possible) &&
      // Field was not passed so a module examination is not possible.
      (this.credits.passed.percentage === 100)
    ) {
      this.hasManualGrade = !isUndefined(examine) ? examine : this.hasManualGrade;
      if (newGrade !== (this.raw.grade || null)) {
        this.hasManualGrade = newGrade !== null;
        this.raw.grade = newGrade;
        this.raw.put();
      }
    }

    this.doAnalysis();
  }


  /**
   * Update field minimization setting.
   */
  minimize() {
    this.raw.minimized = this.minimized;
    this.raw.put();
  }
}
