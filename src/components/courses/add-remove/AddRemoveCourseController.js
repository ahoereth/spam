import {
  find, filter, get, has, map, values, flatten, includes,
} from 'lodash-es';


export default class AddRemoveCourseController {
  static $inject = ['$scope', 'User'];

  constructor($scope, User) {
    this.$scope = $scope;
    this.User = User;
  }

  $onInit() {
    this.$scope.$on('user-construct', this.userConstruct);

    // Add remove buttons are only required for loggedin users.
    if (this.User.details) {
      this.userConstruct(undefined, get(this.User, 'details'));
    }
  }

  userConstruct(event, user = {}) {
    this.user = {
      loggedin: !!user.username,
      regulation_id: get(user, 'regulation_id'),
    };

    // The fields array might contain all fields from all regulations -
    // we only care about the regulations relevant for the current user.
    this.fields = filter(this.course.fields, ({ regulations }) =>
      includes(flatten(map(regulations, values)), this.user.regulation_id),
    );

    // If there is one or no regulation there is a way to enroll
    // without opening a dropdown.
    this.singleField = get(this.fields, [0, 'field_id']);

    // Find course in current user's transcript to set enrollment state
    // correctly and in order to unenroll from it if required.
    if (this.User.courses) {
      const sic = find(this.User.courses, { course_id: this.course.course_id });
      this.enrolled = has(sic, 'student_in_course_id');
      this.studentInCourseId = get(sic, 'student_in_course_id');
    }
  }

  add(fieldId) {
    this.busy = true;
    this.User.addCourse(this.course, fieldId)
      .then(course => {
        this.studentInCourseId = course.student_in_course_id;
        this.enrolled = true;
      })
      .finally(() => { this.busy = false; });
  }

  remove() {
    this.busy = true;
    this.User.removeCourse(this.studentInCourseId)
      .then(() => {
        this.enrolled = false;
        this.studentInCourseId = undefined;
      })
      .finally(() => { this.busy = false; });
  }
}
