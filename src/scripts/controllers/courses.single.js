(function() {
  'use strict';

  /**
   * CONTROLLER: Course
   * ROUTE: /courses/:course_id
   *
   * Single course view.
   */
  angular
    .module('spam.controllers.courses')
    .controller('Course', courseCtrl);


  /* @ngInject */
  function courseCtrl(
    $scope,
    $rootScope,
    $routeParams,
    $modal,
    Restangular,
    _
  ) {
    Restangular
      .one('courses', $routeParams.courseId)
      .get({ user: $scope.user.getUsername() })
      .then(function(course) {
        $scope.course = course;
        course.fields_by_regulations = {};

        _.forEach(course.fields, function(field) {
          _.forEach(field.regulations, function(regulation) {
            if (_.isUndefined(course.fields_by_regulations[regulation.regulation])) {
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

    // edit guide options modal
    $scope.guideModal = function() {
      $modal.open({
        templateUrl: 'partials/guide/modal.html',
        /* @ngInject */
        controller: function($scope, $modalInstance, Restangular) {
          var course = $scope.$parent.course;
          Restangular
            .all('guides')
            .one('courses', course.course_id)
            .get()
            .then(function(guide) {
              guide.course_id = course.course_id;
              $scope.guideInc = guide;
              watch();
            });

          var watch = function() {
            $scope.$watch( 'guideInc', function(obj, init) {
              if (obj === init) { return; }

              $scope.guideInc.put();
            }, true );
          };

          $scope.close = function() {
            $modalInstance.close();
            watch();
          };
        },
        scope: $scope
      });
    };
  }
})();
