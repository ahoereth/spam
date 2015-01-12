(function() {
  'use strict';

  angular
    .module('spam.controllers')
    .controller('Root', rootCtrl);


  /* @ngInject */
  function rootCtrl(
    $rootScope,
    $scope,
    $log,
    $location,
    DataHandler,
    Courses,
    _
  ) {
    DataHandler.userInit();


    /**
     * Adds a course to the curent user's planner.
     *
     * @param {int} courseId course_id database field
     * @param {int} fieldId  field_id database field
     */
    $scope.addCourse = function(studentInCourse, fieldId) {
      var courseId;

      // if first parameter is empty we wont be doing anything
      if (_.isUndefined(studentInCourse)) {
        return;
      }

      // first parameter is the course_id;
      if (_.isNumber(studentInCourse)) {
        courseId = studentInCourse;
        studentInCourse = {
          course_id: courseId,
          field_id : _.isNumeric(fieldId) ? fieldId : null
        };

      // got the whole course object as first parameter
      } else {
        courseId = studentInCourse.course_id;
      }

      var target = Courses.get($scope.user.getRegulation(), courseId);
      if (target) {
        target.enrolled = true;
      }

      $scope.user.all('courses').post(studentInCourse).then(function(course) {
        DataHandler.resetGuide();

        if (target) {
          target.student_in_course_id = course.student_in_course_id;
        }

        if ($scope.user.courses) {
          $scope.user.courses.push(course);
        }

        if (studentInCourse.course_id) {
          $scope.$broadcast('courseAdded_' + studentInCourse.course_id, course);
        }

        $scope.$broadcast('courseAdded', course);
        $log.info('Added: ' + course.course);
      });
    };


    /**
     * Removes a course from the current user's planner.
     *
     * @param {int}    courseId course_id database field
     * @param {object} course   object used for broadcasting
     */
    $scope.removeCourse = function(course) {
      var target2 = _.findWhere($scope.user.courses, {
        student_in_course_id : course.student_in_course_id
      });
      $rootScope.user.courses = _.without($scope.user.courses, target2);

      var target = Courses.get($rootScope.user.getRegulation(), course.course_id);
      if (target) {
        target.enrolled = false;
      }

      $scope.user.one('courses', course.student_in_course_id).remove().then(function() {
        DataHandler.resetGuide();

        //Courses.unroll($rootScope.user.getRegulation(), course.course_id);
        if (target) {
          target.student_in_course_id = null;
        }

        $log.info('Removed: ' + course.course);
        $scope.$broadcast('courseRemoved', course);
        $scope.$broadcast('courseRemoved_'+course.course_id, course);
      }, function() {
        $log.info('Couldnt remove: ' + course.course);
        $rootScope.user.courses.push(target2);
      });
    };


    $scope.$on('userDestroy', function() {
      DataHandler.removeAll();
      DataHandler.userInit();
      $location.path('/');
    });


    $scope.$on('title', function(event, variables) {
      var title = angular.isDefined(variables.title) ? variables.title : $rootScope.title;

      angular.forEach(variables, function(value, key) {
        if (key.charAt(0) === ':') {
          title = title.replace(key, value);
        }
      });

      if ( title !== '' ) {
        title += ' :: ';
      }

      $rootScope.title = title + 'Studyplanning in Cognitive Science';
    });


    $scope.$on('userUpdated', function(event, user) {
      angular.forEach(user, function(value, key) {
        $scope.user[key] = value;
      });
    });
  }
})();
