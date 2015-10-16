(function () {
  'use strict';

  /**
   * MODULE: contenteditable
   * DIRECTIVE: contenteditable
   */
  angular
    .module('contenteditable', ['ngSanitize'])
    .directive('contenteditable', contenteditableDirective);




  /* @ngInject */
  function contenteditableDirective() {
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function(scope, element, attrs, ngModel) {
        function read() {
          ngModel.$setViewValue(element.html());
        }

        ngModel.$render = function() {
          element.html(ngModel.$viewValue.replace(/\n/g, '<br>') || '');
        };

        element.bind('blur keyup change', function() {
          scope.$apply(read);
        });
      }
    };
  }

}());
