(function() {
  'use strict';

  /**
   * api/courses provider. Used in order to minimize api requests for pulling
   * courses. This way we can quickly expose many courses to the application.
   * Search and everything is done on the frontend! Makes the backend much leaner.
   */
  angular
    .module('spam.services')
    .factory('Courses', CoursesFactory);


  /* @ngInject */
  function CoursesFactory(
    $q,
    $filter,
    Restangular,
    _
  ) {
    var fetchedYears = {},
        courses = {},
        currentYear = new Date().getFullYear(),
        lowestYear = 2000,
        promises = [];

    var self = {};


    /**
     * Fetch a set of courses from the server.
     *
     * @param  {int} regulation regulation_id
     * @param  {int} lower      lower end of the year range to get courses for
     * @param  {int} upper      upper end of "
     * @return {promise}        promise which will contain the whole ranch of
     *                          courses when resolved
     */
    self.fetch = function(regulation, lower, upper) {
      var reg = regulation === '' ? 0 : regulation;

      var deferred  = $q.defer();
      var deferred2 = $q.defer();
      promises.push(deferred.promise);

      lower = _.isUndefined(lower) ? lowestYear  : lower;
      upper = _.isUndefined(upper) ? currentYear : upper;

      if (_.isUndefined(fetchedYears[reg])) {
        fetchedYears[reg] = [];
        courses[reg] = [];
      }

      var range = _.difference(_.range(lower, upper+1), fetchedYears[reg]);

      // needs some fixing. What about when we already pulled years inbetween?
      var upperDb = range[range.length-1];
      var lowerDb = range[0];

      if (! _.isEmpty(range)) {
        fetchedYears[reg] = _.union(fetchedYears[reg], range);

        // replace with getList() aso soon as we fixed the sql speed on this one problems...
        Restangular.all('courses').customGET('', {
          regulation_id: regulation,
          lower: lowerDb,
          upper: upperDb,
          limit: 2000
        }).then(function(newCourses) {
          courses[reg] = _.union(courses[reg], newCourses.data);
          deferred.resolve();
        });
      } else {
        deferred.resolve();
      }

      // used for cases where there might be many quick responses at once, the current one
      // might need data from one of the others which did not yet finish. Wait for those.
      $q.all(promises).then(function() {
        // get the part of interest
        deferred2.resolve($filter('courseFilter')(courses[reg], {
          'year#<&&year#>': (lower-1)+'&&'+(upper+1)
        }));
      });

      return deferred2.promise;
    };


    /**
     * Reset the complete local course data cache.
     */
    self.reset = function() {
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
    self.get = function(regulation, courseId) {
      return _.findWhere(courses[regulation], {course_id: courseId});
    };


    return self;
  }
})();
