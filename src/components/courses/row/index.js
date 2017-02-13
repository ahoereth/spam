import angular from 'angular';
import { reduce } from 'lodash-es';

import nl2br from '../../lib/nl2br';
import year from '../../lib/year';
import icon from '../../lib/icon';

import template from './row.html';
import './row.less';


// TODO: component
const courserowDirective = () => ({
  template,
  restrict: 'E',
  replace: true,
  scope: {
    course: '=',
    action: '&action',
  },
  link: function courserowLink(scope, elem, attrs) {
    scope.opt = {};

    if (undefined !== attrs.expanded) {
      scope.opt.initiallyExpanded = true;
      scope.opt.expanded = true;
    }

    if (undefined !== attrs.addRemoveCourse) {
      scope.opt.addRemoveCourse = true;
    }
  },
});


// TODO: component
const courserowFieldsDirective = () => ({
  restrict: 'E',
  replace: true,
  scope: {
    fields: '=fields',
  },
  template: '<span>{{::list}}</span>',
  link: function courserowFieldsLink(scope) {
    if (!scope.fields) { return; }

    scope.list = reduce(scope.fields, (list, val, key) => {
      if (list !== '') { list += ', '; }
      if (val.hasOwnProperty('field')) {
        return list + val.field +
               (val.course_in_field_type === 'PM' ? ' (PM)' : '');
      }

      return `${list} ${key} : ${val}`;
    }, '');
  },
});


/**
 * MODULE: spam.courses.row
 * DIRECTIVES:
 *   courserow
 *   courserowFields
 *
 * TODO: migrate to components
 */
export default angular
  .module('spam.courses.row', [nl2br, year, icon])
  .directive('courserow', courserowDirective)
  .directive('courserowFields', courserowFieldsDirective)
  .name;
