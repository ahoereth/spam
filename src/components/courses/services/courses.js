import angular from 'angular';
import {
  isUndefined, difference, range, isEmpty, union, find,
} from 'lodash-es';

import restangular from '../../lib/restangular';


/* @ngInject */
function coursesFactory($q, $filter, Restangular) {
  const currentYear = new Date().getFullYear();
  const lowestYear = 2000;
  const self = {};
  let fetchedYears = {};
  let courses = {};
  let promises = [];


  /**
   * Fetch a set of courses from the server.
   *
   * @param  {int} regulation regulation_id
   * @param  {int} lower      lower end of the year range to get courses for
   * @param  {int} upper      upper end of "
   * @return {promise}        promise which will contain the whole ranch of
   *                          courses when resolved
   */
  self.fetch = (regulation, lower, upper) => {
    const reg = regulation === '' ? 0 : regulation;

    const deferred = $q.defer();
    const deferred2 = $q.defer();
    promises.push(deferred.promise);

    lower = isUndefined(lower) ? lowestYear : lower;
    upper = isUndefined(upper) ? currentYear : upper;

    if (isUndefined(fetchedYears[reg])) {
      fetchedYears[reg] = [];
      courses[reg] = [];
    }

    const years = difference(range(lower, upper + 1), fetchedYears[reg]);

    // needs some fixing. What about when we already pulled years inbetween?
    const upperDb = years[years.length - 1];
    const lowerDb = years[0];

    if (!isEmpty(years)) {
      fetchedYears[reg] = union(fetchedYears[reg], years);

      // replace with getList() aso soon as we fixed the sql speed on this one problems...
      Restangular.all('courses').customGET('', {
        regulation_id: regulation,
        lower: lowerDb,
        upper: upperDb,
        limit: 2000,
      }).then(newCourses => {
        courses[reg] = union(courses[reg], newCourses.data);
        deferred.resolve();
      });
    } else {
      deferred.resolve();
    }

    // used for cases where there might be many quick responses at once, the current one
    // might need data from one of the others which did not yet finish. Wait for those.
    $q.all(promises).then(() => {
      // get the part of interest
      deferred2.resolve($filter('courseFilter')(courses[reg], {
        'year#<&&year#>': `${lower - 1}&&${upper + 1}`,
      }));
    });

    return deferred2.promise;
  };


  /**
   * Reset the complete local course data cache.
   */
  self.reset = () => {
    fetchedYears = {};
    courses = {};
    promises = [];
  };


  /**
   * Get a specific course.
   *
   * @param  {int}    regulation regulation_id
   * @param  {int}    courseId   course_id to get
   * @return {object}            course with all available information
   */
  self.get = (regulation, courseId) => (
    find(courses[regulation], { course_id: courseId })
  );


  return self;
}


/**
 * MODULE: spam.courses.services.courses
 * SERVICE: Courses
 */
export default angular
  .module('spam.courses.services.courses', [restangular])
  .factory('Courses', coursesFactory)
  .name;
