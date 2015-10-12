(function() {
  'use strict';

  /**
   * MODULE: spam.components.guide
   * CONTROLLER: GuideController
   * ROUTE: /guide
   */
  angular
    .module('spam.components.guide', [])
    .config(guideRouting)
    .controller('GuideController', guideController);




  /* @ngInject */
  function guideRouting($routeProvider) {
    var auth = {
      /* @ngInject */
      authentication: function($route, Auth) {
        return Auth.authenticate($route.current.access);
      }
    };

    $routeProvider.when('/guide', {
      templateUrl: 'components/guide/guide.html',
      controller: 'GuideController',
      controllerAs: 'guide',
      title: 'Guide',
      access: 0,
      resolve: auth
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
