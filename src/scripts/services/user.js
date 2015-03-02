(function() {
  'use strict';

  /**
   * User functionality factory. All functionality provided by this factory is
   * injected into the global ($rootScope) user object.
   */
  angular
    .module('spam.services')
    .factory('User', userFactory);


  /* @ngInject */
  function userFactory(
    $rootScope,
    $log,
    Restangular,
    _
  ) {
    var self = {
      facts   : {},
      fields  : {},
      courses : {},
      watchers: []
    };


    var fieldData = {};


    function callWatchers() {
      _.forEach(self.watchers, _.attempt);
    }


    function calculateGrade(data) {
      var passedCredits = data.pluck('passedCredits');

      var gradeSum = data.pluck('grade')
                         .mapOnto(passedCredits.value(), _.multiply)
                         .sum();

      return _.formatGrade(gradeSum.value() / passedCredits.sum().value());
    }


    var factsCalculation = _.debounce(function() {
      var fields = _.chain(fieldData).sortByAll('grade');

      self.facts.grades = {
        overall: calculateGrade(fields),
        bachelor: calculateGrade(fields.where({
            examinationPossible: true,
            completed: true
          }).take(5)
        )
      };

      callWatchers();
    }, 200);


    /**
     * Save userdata to server.
     *
     * @param {object} data  [description]
     * @param {bool}   force Force the update even if the data seems to be
     *                       unchanged.
     */
    self.updateUser = function(data, force) {
      var putData = {};
      angular.forEach(data, function(value, key) {
        if (! angular.equals($rootScope.user[key], value) || force) {
          putData[key] = value;
          $rootScope.user[key] = value;
        }
      });

      putData.username = $rootScope.user.username;
      putData = Restangular.restangularizeElement(null, putData, 'users');

      putData.put().then(function(user) {
        $rootScope.$broadcast('userUpdated', user);
        $log.info('User data saved.');
      });
    };


    self.destroy = function() {
      $log.info('Destroying local user data.');
      $rootScope.$broadcast('userDestroy');
    };


    self.deleteUser = function() {
      $log.info('Deleting global user data.');
      //$rootScope.$broadcast('userDelete');
      if ($rootScope.user) {
        $rootScope.user.remove().then(function() {
          // notify client that deletion was successful
          $log.info('Global user data deleted.');
        }, function() {
          // do something when removing fails
          $log.info('Error while deleting global user data.');
        });

        // handle local and global user data deletion asynchronously
        self.destroy();
      }
    };


    self.getRegulation = function(reg) {
      return this.regulation_id || (reg || null);
    };


    self.getUsername = function() {
      return this.username || null;
    };


    /**
     * TODO: Not functional.
     * TODO: handle course_id and/or student_in_course_id as argument
     */
    self.removeCourse = function(course) {
      console.log('Remove course from user transcript:', course, self.courses);

      if (_.isNumber(course)) {} // student_in_course_id

      console.log(course);

      self.courses = _.without(self.courses, course);
    };


    self.updateFieldData = function(id, data) {
      fieldData[id] = data;
      factsCalculation();
    };


    self.addWatcher = function(func) {
      self.watchers.push(func);
      return self.watchers.length - 1;
    };


    self.construct = function(data) {
      if (angular.isDefined(data)) {
        if (angular.isDefined(data.courses)) {
          Restangular.restangularizeCollection(data, data.courses, 'courses');
        }

        if (angular.isDefined(data.fields)) {
          Restangular.restangularizeCollection(data, data.fields, 'fields');
        }

        data.thesis_grade = _.formatGrade(data.thesis_grade);
      }

      self = _.extend(self, data, {loggedin: ! _.isEmpty(data)});

      return self;
    };

    return self;
  }
})();
