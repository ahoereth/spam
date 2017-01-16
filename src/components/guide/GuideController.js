import { forEach, groupBy } from 'lodash-es';


export default class GuideController {
  static $inject = ['Restangular'];

  constructor(Restangular) {
    this.courses = {};
    Restangular.one('guides', 1).getList('courses').then(guide => {
      forEach(
        groupBy(guide, course => (course.year + course.term)),
        (course, k) => { this.courses[k] = groupBy(course, 'singleField'); },
      );
    });
  }
}
