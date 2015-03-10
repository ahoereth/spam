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
    $cacheFactory,
    $rootScope,
    $http,
    $log,
    Restangular,
    _
  ) {
    var webstorage = angular.isDefined(Storage) ? true : false;

    var self = {
      facts   : {},
      fields  : {},
      courses : {},
      watchers: [],
      logininfo: {
        username: null,
        authdata: null
      }
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
      var facts = self.facts;
      var fields = _.chain(fieldData).sortByAll('grade');

      // TODO: this '5' should be somehow dynamic
      facts.bscFieldsCount = 5;
      var bscFields = fields.where({
                        examinationPossible: true,
                        completed: true
                      })
                      .take(facts.bscFieldsCount);

      facts.bscFieldsCompletedCount = bscFields.size().value();

      facts.grades = {
        overall: calculateGrade(fields),
        bachelor: calculateGrade(bscFields)
      };

      facts.credits = {
        passed: fields.pluck('passedCredits').sum().value(),
        enrolled: fields.pluck('enrolledCredits').sum().value()
      };

      callWatchers();
    }, 200);


    // TODO: required?
    self.setLogininfo = function(username, authdata, trust) {
      self.logininfo = {
        username: username,
        authdata: authdata
      };

      if (webstorage) {
        var storage = trust ? localStorage : sessionStorage;
        storage.setItem('authdata', authdata);
        storage.setItem('username', username);
      }
    };


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


    self.logout = function() {
      $log.info('Destroying local user data.');

      // Reset login information.
      self.logininfo = {username: null, authdata: null};
      $http.defaults.headers.common.Authorization = undefined;
      if (webstorage) {
        sessionStorage.removeItem('authdata');
        sessionStorage.removeItem('username');
        localStorage.removeItem('authdata');
        localStorage.removeItem('username');
      }

      // Reset guide.
      var guide = $cacheFactory.get('guide');
      if (guide) { guide.removeAll(); }

      // Reconstruct user with empty dataset.
      self.construct();
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


    self.updateThesis = function(title, grade) {
      var details = self.details;
      details.thesis = {
        title: title,
        grade: grade = _.formatGrade(grade)
      };

      details
        .one('regulations', details.regulation_id)
        .customPUT(details.thesis)
        .then(function() {
          $log.info('Student thesis updated: ' + title + ' - ' + grade);
        });

      return details.thesis;
    };

    self.getRegulation = function(reg) {
      return this.regulation_id || (reg || null);
    };


    self.getUsername = function() {
      return this.username || null;
    };


    /**
     * Removes a course from the current user's planner.
     *
     * @param {int}    courseId course_id database field
     * @param {object} course   object used for broadcasting
     */
    self.removeCourse = function(course) {
      var courseId = _.isObject(course) ?
        course.course_id : course;

      course = _.findWhere(self.courses, {
        course_id: courseId
      });

      var title = course.course;
      var enrolledFieldId = course.enrolled_field_id;
      var studentInCourseId = course.student_in_course_id;

      var promise = course.remove().then(function() {
        $log.info('Removed: ' + title);
      }, function() {
        $log.info('Couldn\'t remove: ' + title);
        course.enrolled_field_id = enrolledFieldId;
        course.student_in_course_id = studentInCourseId;
      });

      course.enrolled_field_id = null;
      course.student_in_course_id = null;
      return promise;
    };


    /**
     * Adds a course to the current user's planner.
     *
     * @param {int} courseId course_id database field
     * @param {int} fieldId  field_id database field
     */
    self.addCourse = function(courseId, fieldId) {
      if (_.isUndefined(courseId)) { return; }

      fieldId = fieldId !== 'null' ? fieldId : null;

      return self.courses.post({
        course_id: courseId,
        field_id : fieldId || null
      }).then(function(course) {
        self.courses.push(course);
        $log.info('Added: ' + course.course);
      });
    };


    self.moveCourse = function(studentInCourseId, fieldId) {
      if (_.isUndefined(studentInCourseId)) { return; }

      var course = _.findWhere(self.courses, {
        student_in_course_id: studentInCourseId
      });

      course.enrolled_field_id = _.isNumeric(fieldId) ? parseInt(fieldId, 10) : 1;

      return course.put();
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
      // Reset data.
      self.fields   = undefined;
      self.courses  = undefined;
      self.details  = undefined;

      if (data) {
        if (! _.isUndefined(data.courses)) {
          Restangular.restangularizeCollection(data, data.courses, 'courses');
          self.courses = data.courses;
        }

        if (! _.isUndefined(data.fields)) {
          Restangular.restangularizeCollection(data, data.fields, 'fields');
          self.fields  = data.fields;
        }

        self.details = _.omit(data, ['fields', 'courses']);
      }

      $rootScope.user = self.details;
      return self;
    };


    // Initialize logininfo from session or localstorage.
    self.logininfo = {
      username: webstorage ?
        sessionStorage.getItem('username') ||
        localStorage.getItem('username') :
        null,
      authdata: webstorage ?
        sessionStorage.getItem('authdata') ||
        localStorage.getItem('authdata') :
        null
    };


    return self;
  }
})();
