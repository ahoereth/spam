(function() {
  'use strict';

  /**
   * MODULE: spam.components.guide
   * CONTROLLER: GuideController
   * ROUTE: /guide
   */
  angular
    .module('spam.components.guide', [
      'lodash',
      'restangular',
      'spam.components.app.services.routes',
      'spam.components.courses.single'
    ])
    .config(guideRouting)
    .controller('GuideController', guideController);




  /* @ngInject */
  function guideRouting(RoutesProvider) {
    RoutesProvider.add('/guide', {
      controller: 'GuideController',
      controllerAs: 'guide',
      templateUrl: 'components/guide/guide.html',
      title: 'Guide'
    });
  }




  /* @ngInject */
  function guideController(
    Restangular,
    _
  ) {
    var ctrl = this;
    ctrl.courses = {};
    Restangular.one('guides', 1).getList('courses').then(function(guide) {
      _(guide)
        .groupBy(function(course) {
          return course.year + course.term;
        })
        .each(function(course, k) {
          ctrl.courses[k] = _.groupBy(course, 'singleField');
        })
        .value();
    });
  }

})();
