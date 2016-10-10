import angular from 'angular';

import template from './progressbar.html';
import './progress.css';


const progressDirective = () => ({
  restrict: 'E',
  transclude: true,
  template: '<div class="progress" ng-transclude></div>',
});


const progressbarDirective = () => ({
  template,
  restrict: 'A',
  require: '^^progress',
  scope: {
    type: '=',
    value: '=',
    text: '=',
  },
  bindToController: true,
  controller: () => {},
  controllerAs: '$ctrl',
});


/**
 * MODULE: progress
 * DIRECTIVES:
 *   progress
 *   progressbar
 *
 * Note: Cannot use components here because the 'replace' option is deprecated
 * and Bootstrap does not handle other tags besides 'div' well as progress
 * and progressbar items.
 */
export default angular
  .module('progress', [])
  .directive('progress', progressDirective)
  .directive('progressbar', progressbarDirective)
  .name;
