(function() {
  'use strict';

  /**
   * MODULE: spam.user.index
   * ROUTE: /~
   * CONTROLLER: UserIndexController
   */
  angular
    .module('spam.user.index', [
      'restangular',
      'lodash',
      'iifFilter',
      '720kb.tooltips',
      'spam.app.services.routes',
      'spam.user.services.user',
      'spam.user.index.columns',
      'spam.user.index.thesis-input',
      'spam.user.settings.matriculation-setter'
    ])
    .config(userIndexRouting)
    .controller('UserIndexController', userIndexController);




  /* @ngInject */
  function userIndexRouting(RoutesProvider) {
    RoutesProvider.add('/~', {
      controller: 'UserIndexController',
      controllerAs: 'overview',
      templateUrl: 'components/user/index/user.index.html',
      title: ':username',
      reloadOnSearch: false,
      access: 1
    });
  }




  /* @ngInject */
  function userIndexController(
    $scope,
    Restangular,
    User,
    UserIndexColumns,
    _
  ) {
    var ctrl = this;

    /**
     * Forces a local $scope.$apply - used in cases where changes occur out
     * of the regular cycle.
     */
    function scopeApply() {
      $scope.$apply();
    }


    /**
     * Function to give the user a headstart and add the guide courses for his
     * first semester to his personal overview.
     */
     ctrl.headstart = function() {
      Restangular.one('guides', 1).getList('courses', {
        semester: 1,
        year    : User.details.mat_year,
        term    : User.details.mat_term
      }).then(function(guide) {
        _.forEach(guide, function(course) {
          var field_id = !! course.singleField ? course.singleField :
            _.get(course, 'fields[0].field_id', null);
          User.addCourse(course, field_id);
        });
      });
    };


    // Forces a $scope.$apply when relevant user data changes out-of-cycle.
    User.addWatcher(scopeApply);


    // Initialize local scope data.
    ctrl.user    = User.details;
    ctrl.facts   = User.facts;
    ctrl.fields  = User.fields;
    ctrl.courses = User.courses;
    ctrl.thesisinput = !!(User.details.thesis_title ||
                          User.details.thesis_grade);
  }

})();
