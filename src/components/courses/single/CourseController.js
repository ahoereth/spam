import { forEach, isUndefined, get } from 'lodash-es';


export default class CourseController {
  static $inject = ['$scope', '$routeParams', 'Restangular', 'User'];

  constructor($scope, $routeParams, Restangular, User) {
    Restangular
      .one('courses', $routeParams.courseId)
      .get({ user: get(User, ['details', 'username'], undefined) })
      .then(course => {
        this.course = course;
        course.fields_by_regulations = {};
        forEach(course.fields, field => {
          forEach(field.regulations, ({ regulation, regulation_id }) => {
            if (isUndefined(course.fields_by_regulations[regulation])) {
              course.fields_by_regulations[regulation] = [];
            }

            const fieldclone = angular.copy(field);
            fieldclone.search = `courses?regulation=${regulation_id}&field=${fieldclone.field}`;
            fieldclone.searchpm = `${fieldclone.search}&pm`;
            course.fields_by_regulations[regulation].push(fieldclone);
          });
        });

        // refresh page title
        $scope.$emit('title', { ':course': `${course.course} ${course.year}` });
      });
  }
}
