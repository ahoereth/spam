import { assign, assignIn, map, pick, debounce, has } from 'lodash-es';

import { O2URL } from '../../../config';


export default class AdminMigrateController {
  static $inject = ['$location', '$routeParams', 'Restangular'];

  constructor($location, $routeParams, Restangular) {
    const d = new Date(), m = d.getMonth(), y = d.getFullYear();
    assign(this, {
      $location, Restangular,
      params: $routeParams,
      fetch: debounce(this.fetch, 500),
      year: parseInt(this.params.year, 10) || (m < 5) ? y : y + 1,
      term: this.params.term || (m > 11 || m < 5) ? 'S' : 'W',
      courses: [],
      sieve: {},
    });
  }

  /**
   * Check the SPAM API for whether courses retrieved from the custom IKW o2
   * API already exist.
   *
   * @param {array} courses Array of raw courses from the foreign API.
   */
  fetched(courses) {
    const finders = map(courses, (course, key) => assignIn(pick(course, [
      'year', 'term', 'code', 'course', 'ects', 'hours', 'o3_id',
    ]), { key }));

    this.Restangular.one('courses', 'find').customPOST(finders).then(ids => {
      this.fetching = false;
      this.courses = this.Restangular.restangularizeCollection(
        null,
        // TODO: Needs assignIn?
        map(courses, (c, k) => (has(ids, k) ? { ...c, course_id: ids[k] } : c)),
        'courses',
      );
    });
  }

  /**
   * Fetch courses from the custom IKW o2 API.
   */
  fetch() {
    this.selected = true;
    this.fetching = true;
    this.courses = [];
    this.params = { ...this.params, year: this.year, term: this.term };
    this.$location.search(this.params);
    this.Restangular.allUrl('o2', O2URL).getList({
      year: this.year, term: this.term,
    }).then(this.fetched);
  }

  /**
   * Accepts a o2 course and posts it to the SPAM API.
   *
   * @param  {course} course Course to accept.
   */
  acceptCourse(course) {
    course.accepted = true;
    course.post();
  }
}
