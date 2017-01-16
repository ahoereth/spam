import angular from 'angular';
import {
  forEach, multiply, debounce, attempt, get, isPlainObject, mergeWith,
  find, isUndefined, isNumber, fromPairs, keys, map, omit, findIndex, sum, take,
  filter, size, sortBy,
} from 'lodash-es';

import restangular from '../../lib/restangular';
import formatGrade from '../formatGrade';


function calculateGrade(credits, grades) {
  const acc = sum(mergeWith(grades, credits, multiply));
  return formatGrade(acc / sum(credits));
}


/* @ngInject */
function userFactory(
  $cacheFactory, $rootScope, $location, $http, $log, $q, Restangular
) {
  const webstorage = !isUndefined(Storage); // browser object
  const self = {
    facts: {},
    fields: {},
    courses: {},
    watchers: [],
    logininfo: {
      username: null,
      authdata: null,
    },
  };

  const fieldData = {};


  function callWatchers() {
    forEach(self.watchers, attempt);
  }


  const factsCalculation = debounce(() => {
    const facts = self.facts;
    const fields = sortBy(fieldData, 'grade');

    // TODO: this '5' should be somehow dynamic
    facts.examinationFieldsCount = get(self, 'details.examination_fields', 5);
    const examinationFields = take(filter(fields, {
      examinationPossible: true,
      completed: true,
    }), facts.examinationFieldsCount);

    facts.examinationFieldsCompletedCount = size(examinationFields);

    facts.grades = {
      overall: calculateGrade(map(fields, 'overallPassedCredits'),
                              map(fields, 'overallGrade')),
      graduation: calculateGrade(map(examinationFields, 'passedCredits'),
                                 map(examinationFields, 'grade')),
    };

    // Take thesis grade into consideration.
    // TODO: The weight relation should be information taken from the api.
    const thesisGrade = parseFloat(self.details.thesis_grade);
    if (thesisGrade >= 1 && thesisGrade <= 4) {
      facts.grades.graduation = formatGrade(
        ((parseFloat(facts.grades.graduation) * 2) + thesisGrade) / 3
      );
    }

    // TODO: `3` credits per examination should be a database option.
    facts.examinationCount = sum(map(fields, 'examination'));
    facts.examinationCredits = 3 * (facts.examinationCount || 0);

    facts.credits = {
      passed: sum(map(fields, 'overallPassedCredits')) +
              facts.examinationCredits + (thesisGrade ? 12 : 0),
      // overflow: fields.map('overflowPassedCredits').sum().value(),
      enrolled: sum(map(fields, 'enrolledCredits')),
    };
    callWatchers();
  }, 200);


  // TODO: required?
  self.setLogininfo = function setLogininfo(username, authdata, trust) {
    self.logininfo = { username, authdata };

    if (webstorage) {
      const storage = trust ? localStorage : sessionStorage;
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
  self.updateUser = function updateUser(data, force) {
    if (!self.details) {
      return;
    }

    let putData = {};
    forEach(data, (value, key) => {
      if (!angular.equals(self.details[key], value) || force) {
        putData[key] = value;
        self.details[key] = value;
      }
    });

    putData.username = self.details.username;
    putData = Restangular.restangularizeElement(null, putData, 'users');
    putData.put().then(() => $log.info('User data saved.'));
  };


  self.logout = function logout() {
    $log.info('Destroying local user data.');

    // Reset login information.
    self.logininfo = { username: null, authdata: null };
    $http.defaults.headers.common.Authorization = undefined;
    if (webstorage) {
      sessionStorage.removeItem('authdata');
      sessionStorage.removeItem('username');
      localStorage.removeItem('authdata');
      localStorage.removeItem('username');
    }

    // Reset guide.
    const guide = $cacheFactory.get('guide');
    if (guide) { guide.removeAll(); }

    // Reconstruct user with empty dataset.
    self.construct();

    // Just instantly resolve for now.
    return $q.resolve();
  };


  self.deleteUser = function deleteUser() {
    $log.info('Deleting global user data.');

    self.details.remove().then(() => {
      $log.info('Global user data deleted.');
      $location.search({}).path('/');
      self.logout();
    }, () => {
      $log.info('Error while deleting global user data.');
    });
  };


  self.updateThesis = function updateThesis(title, grade) {
    const regulationId = self.details.regulation_id;
    const thesis = { thesis_title: title, thesis_grade: formatGrade(grade) };
    self.details = { ...self.details, ...thesis };
    self.details.one('regulations', regulationId).customPUT(thesis);
    factsCalculation();
    return thesis;
  };


  self.getRegulation = function getRegulation(reg) {
    return get(self, 'details.regulation_id', (reg || null));
  };


  self.getUsername = function getUsername() {
    return get(self, 'details.username', null);
  };


  /**
   * Removes a course from the current user's planner.
   *
   * @param {int}    courseId course_id database field
   * @param {object} course   object used for broadcasting
   */
  self.removeCourse = function removeCourse(course) {
    const studentInCourseId = isPlainObject(course) ?
      course.student_in_course_id : course;

    course = find(self.courses, {
      student_in_course_id: studentInCourseId,
    });

    if (!course) {
      return $q.reject();
    }

    const title = course.course;
    const enrolledFieldId = course.enrolled_field_id;

    const promise = course.remove().then(() => {
      $log.info(`Removed: ${title}`);
    }, () => {
      $log.info(`Couldn't remove: ${title}`);
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
   * @param {object/int} course  either a object containing course details
   *                             or a integer courseId.
   * @param {int}        fieldId field_id database field (optional).
   */
  self.addCourse = function addCourse(course, fieldId) {
    if (isUndefined(course)) {
      return $q.reject();
    }

    // Create course object if required.
    if (isNumber(course)) {
      course = {
        course_id: course,
      };
    }

    // Fill in field_id.
    course.field_id = isNumber(fieldId) ? fieldId : (course.field_id || null);

    return self.courses.post(course).then(c => {
      const old = find(self.courses, { course_id: c.course_id });

      if (old && c.course_id) {
        old.enrolled_field_id = c.enrolled_field_id;
        old.student_in_course_id = c.student_in_course_id;
      } else {
        self.courses.push(c);
      }

      $log.info(`Added: ${c.course}`);
      return c;
    });
  };


  self.refreshCourse = function refreshCourse(course) {
    const studentInCourseId = isPlainObject(course) ?
      course.student_in_course_id : course;

    const idx = findIndex(self.courses, {
      student_in_course_id: studentInCourseId,
    });

    if (idx === -1) {
      return $q.reject();
    }

    if (isPlainObject(course)) {
      // Course already provided on function call.
      self.courses[idx] = course;
      return $q.resolve();
    }

    // Request fresh course data from API.
    return self.details.one('courses', studentInCourseId).get().then(c => {
      self.courses[idx] = c;
      return true;
    });
  };


  self.updateFieldData = function updateFieldData(id, data) {
    fieldData[id] = data;
    factsCalculation();
  };


  /**
   * Function to return all overflowing credits from the fields.
   *
   * @return {object}
   */
  self.getOverflowingCredits = function getOverflowingCredits() {
    return fromPairs(keys(fieldData), map(fieldData, 'overflowPassedCredits'));
  };


  /**
   * Add a function which will be called whenever the facts update.
   *
   * @param  {function} func
   * @return {int}      Index in the watchers array.
   */
  self.addWatcher = function addWatcher(func) {
    self.watchers.push(func);
    return self.watchers.length - 1;
  };


  self.construct = function construct(data) {
    // Reset data.
    self.fields = undefined;
    self.courses = undefined;
    self.details = undefined;

    if (data) {
      if (!isUndefined(data.courses)) {
        Restangular.restangularizeCollection(data, data.courses, 'courses');
        self.courses = data.courses;
      }

      if (!isUndefined(data.fields)) {
        Restangular.restangularizeCollection(data, data.fields, 'fields');
        self.fields = data.fields;
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
      null,
  };


  return self;
}


/**
 * MODULE: spam.user.services.user
 * SERVICE: User
 */
export default angular
  .module('spam.user.services.user', [restangular])
  .factory('User', userFactory)
  .name;
