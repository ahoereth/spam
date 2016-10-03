import angular from 'angular';
import { reduce } from 'lodash-es';

import nl2br from '../../lib/nl2br';
import year from '../../lib/year';

// import 'row.less';


/**
 * MODULE: spam.courses.row
 * DIRECTIVES:
 *   courserow
 *   courserowFields
 *
 * TODO: migrate to components
 */
export default angular
  .module('spam.courses.row', [nl2br, year])
  .directive('courserow', courserowDirective)
  .directive('courserowFields', courserowFieldsDirective)
  .name;




function courserowDirective() {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      'course': '=',
      'action': '&action'
    },
    templateUrl: 'components/courses/row/row.html',
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
  };
}




function courserowFieldsDirective() {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      fields: '=fields'
    },
    template: '<span>{{::list}}</span>',
    link: function(scope) {
      if (! scope.fields) { return false; }

      scope.list = reduce(scope.fields, function(list, val, key) {
        if (list !== '') { list += ', '; }
        if (val.hasOwnProperty('field')) {
          return list + val.field +
                 ('PM' === val.course_in_field_type ? ' (PM)' : '');
        } else {
          return list + key + ': ' + val;
        }
      }, '');
    }
  };
}
