import angular from 'angular';

import template from './tickable.html';
import './tickable.less';


// TODO: component
const tickableDirective = ['$timeout', $timeout => ({
  template,
  restrict: 'E',
  replace: true,
  transclude: true,
  scope: {
    model: '=ngModel',
    changeTarget: '&ngChange',
  },
  link: function tickableLink(scope) {
    // Calling the ngChange function directly in the template resulted in it
    // being called before the value actually changed.
    scope.change = () => {
      $timeout(() => scope.changeTarget(this), 0);
    };
  },
})];


/**
 * MODULE: tickable
 * DIRECTIVE: tickable
 */
export default angular
  .module('tickable', [])
  .directive('tickable', tickableDirective)
  .name;
