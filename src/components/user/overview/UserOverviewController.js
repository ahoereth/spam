import { assign, forEach, get } from 'lodash-es';


export default class UserOverviewController {
  static $inject = ['$scope', 'Restangular', 'User'];

  constructor($scope, Restangular, User) {
    assign(this, {
      Restangular, $scope,
      UserService: User,
      user: User.details,
      facts: User.facts,
      fields: User.fields,
      courses: User.courses,
      thesisinput: !!(User.details.thesis_title || User.details.thesis_grade),
    });
    // Forces a $scope.$apply when relevant user data changes out-of-cycle.
    User.addWatcher(() => this.apply());
  }

  apply() {
    this.$scope.$apply();
  }

  /**
   * Function to give the user a headstart and add the guide courses for his
   * first semester to his personal overview.
   */
  headstart() {
    this.Restangular.one('guides', 1).getList('courses', {
      semester: 1,
      year: this.UserService.details.mat_year,
      term: this.UserService.details.mat_term,
    }).then(guide => {
      forEach(guide, course => {
        const fieldId = course.singleField ? course.singleField :
          get(course, 'fields[0].field_id', null);
        this.User.addCourse(course, fieldId);
      });
    });
  }
}
