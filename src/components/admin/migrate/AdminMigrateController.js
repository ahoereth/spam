import { assign, assignIn, map, pick, debounce } from 'lodash-es';

import { O2URL } from '~/config';

import './migrate.css';


export default class AdminMigrateController {
  static $inject = ['$location', '$routeParams', 'Restangular'];

  constructor($location, params, Restangular) {
    this.$location = $location;
    this.params = params;
    this.Restangular = Restangular;

    const d = new Date(), m = d.getMonth(), y = d.getFullYear();
    const year = ((m < 5) ? y : y + 1);
    const term = ((m > 11 || m < 5) ? 'S' : 'W');
    assign(this, {
      fetch: debounce(this.fetch, 500),
      year: this.params.year ? parseInt(this.params.year, 10) : year,
      term: this.params.term ? this.params.term : term,
      courses: [],
      sieve: { course_id: '' },
      selected: false,
    });

    if (this.params.year) {
      this.fetch();
    }
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
      this.courses = map(courses, (course, idx) =>
        this.Restangular.restangularizeElement(
          null,
          ids[idx] ? { ...course, course_id: ids[idx] } : course,
          'courses',
          !!ids[idx],
        ),
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
    }).then(courses => this.fetched(courses));
  }

  /**
   * Accepts a o2 course and posts it to the SPAM API.
   *
   * @param  {course} course Course to accept.
   */
  acceptCourse(course) {
    course.save().then(({ course_id }) => {
      course.course_id = course_id;
      course.accepted = true;
    });
  }
}
