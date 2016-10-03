import angular from 'angular';

// import 'tickable.less';


function tickableLink(scope) {
  // Calling the ngChange function directly in the template resulted in it
  // being called before the value actually changed.
  scope.change = function() {
    var self = this;
    $timeout(function() {
      scope.changeTarget(self);
    }, 0);
  };
}


const tickableDirective = ['$timeout', function tickableDirective($timeout) {
  return {
    restrict: 'E',
    replace: true,
    transclude: true,
    scope: {
      model: '=ngModel',
      changeTarget: '&ngChange'
    },
    template:
      '<label class="tickable">' +
        '<ng-transclude></ng-transclude>' +
        '<input type="checkbox" ng-model="model" ng-change="change()">' +
        '<span class="glyphicon glyphicon-ok"></span>' +
      '</label>',
    link: tickableLink
  };
}];


/**
 * MODULE: tickable
 * DIRECTIVE: tickable
 */
export default angular
  .module('tickable', [])
  .directive('tickable', tickableDirective)
  .name;
