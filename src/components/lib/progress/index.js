import angular from 'angular';

import './progress.css';


const progressComponent = {
  transclude: true,
  template: '<div class="progress" ng-transclude></div>',
};


const progressbarDirective = () => ({
  restrict: 'E',
  replace: true,
  require: '^^progress',
  scope: {
    type: '=',
    value: '=',
    text: '=',
  },
  template: '<div class="progress-bar progress-bar-{{type}}" ' +
              'ng-style="{width: value + \'%\'}" ng-bind="text" ' +
              'ng-show="value"></div>',
});


/**
 * MODULE: progress
 * DIRECTIVES:
 *   progress
 *   progressbar
 */
export default angular
  .module('progress', [])
  .component('progress', progressComponent)
  .directive('progressbar', progressbarDirective)
  .name;
