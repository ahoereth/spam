import { assign, defaults, isEmpty } from 'lodash-es';


export default class UserCourseEditController {
  static $inject = ['$location', '$routeParams', 'Restangular', 'User'];

  constructor($location, $routeParams, Restangular, User) {
    const d = new Date(), m = d.getMonth(), y = d.getFullYear();
    assign(this, {
      $location,
      User,
      course: {},
      page: $routeParams.student_in_course_id ? 'edit' : 'new',
      currentTermYear: (m > 3) ? y : y - 1,
      currentTerm: (m > 8 || m < 3) ? 'W' : 'S',
    });

    this.fields = Restangular.all('fields').getList({
      regulation_id: User.details.regulation_id,
    }).$object;

    if (this.page === 'edit') {
      // edit course
      const id = parseInt($routeParams.student_in_course_id, 10);
      User.details.one('courses', id).get().then(c => {
        // No edits allowed for official courses yet.
        if (c.course_id) {
          $location.path('/~/courses/new');
          return;
        }
        this.course = c;
      }, () => {
        // Course does not exist, redirect.
        $location.path('/~/courses/new');
      });
    } else {
      // new course
      const fieldId = $routeParams.fieldId ? parseInt($routeParams.field_id, 10) : 1;
      this.course = {
        enrolled_field_id: fieldId,
        year: this.currentTermYear,
        term: this.currentTerm,
      };
    }
  }

  /**
   * Adds the form data as unofficial course to the user's course collection.
   */
  submit() {
    this.submitted = true;
    this.course = this.course || {};

    // The course needs to be located in some semester and some field.
    defaults(this.course, {
      year: this.currentTermYear,
      term: this.currentTerm,
      field_id: 1,
    });

    // Can't submit if the course has no title.
    if (isEmpty(this.course.course)) {
      this.submitted = false;
      return;
    }

    if (this.course.restangularized) {
      // Update existing course.
      this.course.save().then(refreshedCourse => {
        this.User.refreshCourse(refreshedCourse).then(() => {
          this.$location.search({}).path('/~');
        });
      });
    } else {
      // Add and redirect.
      this.User.addCourse(this.course).then(() => {
        this.submitted = false;
        this.$location.search({}).path('/~');
      });
    }
  }
}
