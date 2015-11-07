(function () {
  'use strict';

  /**
   * MODULE: spam.user.index.grade-input
   * DIRECTIVE: gradeInput
   */
  angular
    .module('spam.user.index.grade-input', [
      'blurOnEnter'
    ])
    .directive('gradeInput', gradeInputDirective);




  function gradeInputDirective() {
    return {
      restrict: 'E',
      replace: true,
      scope: true,
      templateUrl: 'components/user/index/grade-input/user.index.grade-input.html',
      controller: function gradeInputController() {},
      controllerAs: 'gradeinput',
      bindToController: {
        change: '&',
        grade: '=',
        disabled: '='
      },
    };
  }

}());
