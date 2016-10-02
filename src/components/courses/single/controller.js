import { forEach, isUndefined, get } from 'lodash-es';
import 'restangular';

/* @ngInject */
export default ($scope, $routeParams, Restangular, User) => {
  Restangular
    .one('courses', $routeParams.courseId)
    .get({ user: get(User, 'details.username', undefined) })
    .then(function(course) {
      $scope.course = course;
      course.fields_by_regulations = {};

      forEach(course.fields, function(field) {
        forEach(field.regulations, function(regulation) {
          if (isUndefined(course.fields_by_regulations[regulation.regulation])) {
            course.fields_by_regulations[regulation.regulation] = [];
          }

          // generate links
          var fieldclone = angular.copy(field);
          fieldclone.search =
            'courses?regulation=' + regulation.regulation_id +
            '&field=' + fieldclone.field;
          fieldclone.searchpm = fieldclone.search + '&pm';
          course.fields_by_regulations[regulation.regulation].push(fieldclone);
        });
      });

      // refresh page title
      $scope.$emit('title', {':course': course.course + ' ' + course.year});
    });
}
