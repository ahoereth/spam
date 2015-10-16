(function() {
  'use strict';

  /**
   * MODULE: spam.components.user.index
   * ROUTE: /~
   * CONTROLLER: UserIndexController
   */
  angular
    .module('spam.components.user.index', [
      'restangular',
      'lodash',
      'spam.components.app.services.routes',
      'spam.components.user.services.user',
      'spam.components.user.index.field',
      'spam.components.user.index.course',
      'spam.components.user.settings.matriculation-setter'
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
     * Called when any of the thesis details (title or grade) change. Updates
     * the User data.
     */
     ctrl.thesisChange = function() {
      if (User.details.thesis.title === ctrl.thesis.title &&
          User.details.thesis.grade === ctrl.thesis.grade
      ) { return; }

      ctrl.thesis = _.extend(
        ctrl.thesis,
        User.updateThesis(ctrl.thesis.title, ctrl.thesis.grade)
      );
    };


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
    ctrl.thesis  = {
      title :     User.details.thesis.title,
      grade :     User.details.thesis.grade,
      active: !! (User.details.thesis.title ||
                  User.details.thesis.grade)
    };
  }

})();
