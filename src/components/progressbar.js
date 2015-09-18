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
      template: '<div class="progress" ng-transclude></div>'
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
        text: '='
      },
      template: '<div class="progress-bar progress-bar-{{type}}" ' +
                     'ng-style="{width: value + \'%\'}" ng-bind="text"' +
                '></div>'
    };
  }
}());
