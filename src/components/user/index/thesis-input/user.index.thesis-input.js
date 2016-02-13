(function () {
  'use strict';

  /**
   * MODULE: spam.user.index.thesis-input
   * DIRECTIVE: thesisInput
   */
  angular
    .module('spam.user.index.thesis-input', [
      'blurOnEnter',
      'spam.user.services.user'
    ])
    .controller('ThesisInputController', thesisInputController)
    .component('thesisInput', {
      controller: 'ThesisInputController',
      templateUrl: 'components/user/index/thesis-input/user.index.thesis-input.html'
    });




  /* @ngInject */
  function thesisInputController(User) {
    var ctrl = this;

    // Requires user details.
    if (!User.details) {
      return false;
    }

    ctrl.title = User.details.thesis_title;
    ctrl.grade = User.details.thesis_grade;
    ctrl.styled = !ctrl.title || !ctrl.grade;

    ctrl.blur = function() {
      ctrl.styled = !ctrl.title || !ctrl.grade;

      if (User.details.thesis_title === ctrl.title &&
          User.details.thesis_grade === ctrl.grade
      ) { return; }

      var n = User.updateThesis(ctrl.title, ctrl.grade);
      ctrl.title = n.thesis_title;
      ctrl.grade = n.thesis_grade;
    };

    ctrl.focus = function() {
      ctrl.styled = true;
    };
  }

})();
