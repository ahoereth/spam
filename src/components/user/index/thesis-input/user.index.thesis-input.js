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
    .directive('thesisInput', thesisInputDirective);




  /* @ngInject */
  function thesisInputDirective(User) {
    return {
      restrict: 'E',
      replace: true,
      scope: true,
      templateUrl: 'components/user/index/thesis-input/user.index.thesis-input.html',
      link: function(scope/*, elem, attrs*/) {
        // Requires user details.
        if (!User.details) {
          return false;
        }

        scope.thesis = {
          title  : User.details.thesis.title,
          grade  : User.details.thesis.grade
        };

        scope.thesis.styled = !scope.thesis.title || !scope.thesis.grade;

        scope.thesis.blur = function() {
          scope.thesis.styled = !scope.thesis.title || !scope.thesis.grade;

          if (User.details.thesis.title === scope.thesis.title &&
              User.details.thesis.grade === scope.thesis.grade
          ) { return; }

          var n = User.updateThesis(scope.thesis.title, scope.thesis.grade);
          scope.thesis.title = n.title;
          scope.thesis.grade = n.grade;
        };

        scope.thesis.focus = function() {
          scope.thesis.styled = true;
        };
      }
    };
  }

}());
