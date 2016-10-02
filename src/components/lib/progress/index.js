import angular from 'angular';

// import 'progress.css';


/**
 * MODULE: progress
 * DIRECTIVES:
 *   progress
 *   progressbar
 */
export default angular
  .module('progress', [])
  .directive('progress', progressDirective) // TODO: component
  .directive('progressbar', progressbarDirective) // TODO: component
  .name;




/* @ngInject */
function progressDirective() {
  return {
    restrict: 'E',
    replace: true,
    scope: true,
    transclude: true,
    template: '<div class="progress" ng-transclude></div>'
  };
}




/* @ngInject */
function progressbarDirective() {
  return {
    restrict: 'E',
    replace: true,
    require: '^^progress',
    scope: {
      type: '=',
      value: '=',
      text: '='
    },
    template: '<div class="progress-bar progress-bar-{{type}}" ' +
                'ng-style="{width: value + \'%\'}" ng-bind="text" ' +
                'ng-show="value"></div>'
  };
}
