(function () {
  'use strict';

  angular
    .module('progressbar', [])
    .directive('progressbar', progressbarDirective)
    .directive('progress', progressDirective);


  /* @ngInject */
  function progressbarDirective() {
    return {
      restrict: 'E',
      replace: true,
      scope: true,
      transclude: true,
      templateUrl: 'components/progressbar/progressbar.html'
    };
  }


  /* @ngInject */
  function progressDirective() {
    return {
      restrict: 'E',
      replace: true,
      require: '^^progressbar',
      scope: {
        type: '=',
        value: '=',
        content: '='
      },
      templateUrl: 'components/progressbar/progress.html'
    };
  }
}());
