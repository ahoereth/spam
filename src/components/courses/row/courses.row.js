(function () {
  'use strict';

  /**
   * MODULE: spam.courses.row
   * DIRECTIVES:
   *   courserow
   *   courserowFields
   *
   * TODO: controllerAs required?
   */
  angular
    .module('spam.courses.row', [
      'lodash',
      'nl2brFilter',
      'yearFilter'
    ])
    .directive('courserow', courserowDirective)
    .directive('courserowFields', courserowFieldsDirective);




  /* @ngInject */
  function courserowDirective() {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        'course': '=',
        'action': '&action'
      },
      templateUrl: 'components/courses/row/courses.row.html',
      link: function(scope, elem, attrs) {
        var opt = scope.opt = {};

        if (undefined !== attrs.expanded) {
          opt.initiallyExpanded = true;
          opt.expanded = true;
        }

        if (undefined !== attrs.addRemoveCourse) {
          opt.addRemoveCourse = true;
        }
      },
      controllerAs: 'courserow'
    };
  }




  /* @ngInject */
  function courserowFieldsDirective(_) {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        fields: '=fields'
      },
      template: '<span>{{::list}}</span>',
      link: function(scope) {
        if (! scope.fields) { return false; }

        scope.list = _.chain(scope.fields).reduce(function(list, val, key) {
          if (val.hasOwnProperty('field')) {
            return list + ', ' + val.field +
                   ('PM' === val.course_in_field_type ? ' (PM)' : '');
          } else {
            return list + ', ' + key + ': ' + val;
          }
        }, '').trimLeft(', ').value();
      }
    };
  }

}());
