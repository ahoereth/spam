import angular from 'angular';
import {
  forEach, multiply, debounce, chain, attempt, pick, get, isPlainObject,
  find, isUndefined, isNumber, fromPairs, keys, map, omit, findIndex
} from 'lodash-es';

import restangular from '../../lib/restangular';
import formatGrade from '../formatGrade';


/**
 * MODULE: spam.user.services.user
 * SERVICE: User
 */
export default angular
  .module('spam.user.services.user', [restangular])
  .factory('User', userFactory)
  .name;




/* @ngInject */
function userFactory(
  $cacheFactory, $rootScope, $location, $http, $log, $q, Restangular
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
    forEach(self.watchers, attempt);
  }


  function calculateGrade(credits, grades) {
    var acc = grades.mergeWith(credits.value(), multiply).sum();
    return formatGrade(acc.value() / credits.sum().value());
  }


  var factsCalculation = debounce(function() {
    var facts = self.facts;
    var fields = chain(fieldData).sortBy('grade');

    // TODO: this '5' should be somehow dynamic
    facts.bscFieldsCount = 5;
    var bscFields = fields.filter({
                      examinationPossible: true,
                      completed: true
                    })
                    .take(facts.bscFieldsCount);

    facts.bscFieldsCompletedCount = bscFields.size().value();

    facts.grades = {
      overall : calculateGrade(fields.map('overallPassedCredits'),
                               fields.map('overallGrade')),
      bachelor: calculateGrade(bscFields.map('passedCredits'),
                               bscFields.map('grade'))
    };

    // Take thesis grade into consideration.
    // TODO: The weight relation should be information taken from the api.
    var thesisGrade = parseFloat(self.details.thesis_grade);
    if (thesisGrade >= 1 && thesisGrade <= 4) {
      facts.grades.bachelor = formatGrade(
        (parseFloat(facts.grades.bachelor) * 2 + thesisGrade) / 3
      );
    }

    // TODO: `3` credits per examination should be a database option.
    facts.examinationCount = fields.map('examination').sum().value();
    facts.examinationCredits = 3 * (facts.examinationCount || 0);

    facts.credits = {
      passed  : fields.map('overallPassedCredits').sum().value() +
                facts.examinationCredits + (thesisGrade ? 12 : 0),
      //overflow: fields.map('overflowPassedCredits').sum().value(),
      enrolled: fields.map('enrolledCredits').sum().value()
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
    if (! self.details) {
      return false;
    }

    var putData = {};
    forEach(data, function(value, key) {
      if (! angular.equals(self.details[key], value) || force) {
        putData[key] = value;
        self.details[key] = value;
      }
    });

    putData.username = self.details.username;
    putData = Restangular.restangularizeElement(null, putData, 'users');

    putData.put().then(function(/*user*/) {
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

    // Just instantly resolve for now.
    return $q.resolve();
  };


  self.deleteUser = function() {
    $log.info('Deleting global user data.');

    self.details.remove().then(function() {
      $log.info('Global user data deleted.');
      $location.search({}).path('/');
      self.logout();
    }, function() {
      $log.info('Error while deleting global user data.');
    });
  };


  self.updateThesis = function(title, grade) {
    var details = self.details;
    details.thesis_title = title;
    details.thesis_grade = formatGrade(grade);
    var thesis = pick(details, 'thesis_title', 'thesis_grade');
    details.one('regulations', details.regulation_id).customPUT(thesis);
    factsCalculation();
    return thesis;
  };


  self.getRegulation = function(reg) {
    return get(self, 'details.regulation_id') || (reg || null);
  };


  self.getUsername = function() {
    return get(self, 'details.username') || null;
  };


  /**
   * Removes a course from the current user's planner.
   *
   * @param {int}    courseId course_id database field
   * @param {object} course   object used for broadcasting
   */
  self.removeCourse = function(course) {
    var studentInCourseId = isPlainObject(course) ?
      course.student_in_course_id : course;

    course = find(self.courses, {
      student_in_course_id: studentInCourseId
    });

    if (! course) {
      return $q.reject();
    }

    var title = course.course;
    var enrolledFieldId = course.enrolled_field_id;

    var promise = course.remove().then(
      function() {
        $log.info('Removed: ' + title);
      }, function() {
        $log.info('Couldn\'t remove: ' + title);
        course.enrolled_field_id = enrolledFieldId;
        course.student_in_course_id = studentInCourseId;
      }
    );

    course.enrolled_field_id = null;
    course.student_in_course_id = null;
    return promise;
  };


  /**
   * Adds a course to the current user's planner.
   *
   * @param {object/int} course  either a object containing course details
   *                             or a integer courseId.
   * @param {int}        fieldId field_id database field (optional).
   */
  self.addCourse = function(course, fieldId) {
    if (isUndefined(course)) {
      return $q.reject();
    }

    // Create course object if required.
    if (isNumber(course)) {
      course = {
        course_id: course
      };
    }

    // Fill in field_id.
    course.field_id = isNumber(fieldId) ? fieldId :
      (course.field_id || null);

    return self.courses.post(course).then(function(course) {
      var old = find(self.courses, { course_id: course.course_id });

      if (old && course.course_id) {
        old.enrolled_field_id = course.enrolled_field_id;
        old.student_in_course_id = course.student_in_course_id;
      } else {
        self.courses.push(course);
      }

      $log.info('Added: ' + course.course);
      return old;
    });
  };


  self.refreshCourse = function(course) {
    var studentInCourseId = isPlainObject(course) ?
      course.student_in_course_id : course;

    var idx = findIndex(self.courses, {
      student_in_course_id: studentInCourseId
    });

    if (-1 === idx) {
      return $q.reject();
    }

    if (isPlainObject(course)) {
      // Course already provided on function call.
      self.courses[idx] = course;
      return $q.resolve();
    }

    // Request fresh course data from API.
    return self.details.one('courses', studentInCourseId)
      .get().then(function(c) {
        self.courses[idx] = c;
        return true;
      });
  };


  self.updateFieldData = function(id, data) {
    fieldData[id] = data;
    factsCalculation();
  };


  /**
   * Function to return all overflowing credits from the fields.
   *
   * @return {object}
   */
  self.getOverflowingCredits = function() {
    return fromPairs(keys(fieldData), map(fieldData, 'overflowPassedCredits'));
  };


  /**
   * Add a function which will be called whenever the facts update.
   *
   * @param  {function} func
   * @return {int}      Index in the watchers array.
   */
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
      if (!isUndefined(data.courses)) {
        Restangular.restangularizeCollection(data, data.courses, 'courses');
        self.courses = data.courses;
      }

      if (!isUndefined(data.fields)) {
        Restangular.restangularizeCollection(data, data.fields, 'fields');
        self.fields  = data.fields;
      }

      data.thesis_grade = formatGrade(data.thesis_grade);
      self.details = omit(data, ['fields', 'courses']);
    }

    $rootScope.$broadcast('user-construct', self.details);
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
