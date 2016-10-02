import angular from 'angular';
import {
  range, clone, isArray, sum, map, trimEnd, repeat, parseInt,
  indexOf, max, partial, flow, add, min, partialRight, groupBy, sortBy
} from 'lodash-es';

import sortable from '../../../lib/sortable';
import userService from '../../services/user';
import field from '../field';
import course from '../course';

// import './columns.less';


/**
 * MODULE: spam.user.overview.field
 * DIRECTIVE: field
 * CONTROLLER: UserIndexFieldController
 */
export default angular
  .module('spam.user.overview.columns', [
    sortable,
    userService,
    field,
    course
  ])
  .directive('overviewColumns', userIndexColumnsDirective)
  .factory('UserIndexColumns', userIndexColumnsFactory)
  .name;




/* @ngInject */
function userIndexColumnsFactory(
  $window,
  User
) {
  var breakpoints = [750, 970, 1170];
  var columns;


  function buildColumns(fields, columncount) {
    columncount = columncount || 3;

    // Order might be set by the user.
    var order = User.details.overview_order;
    if (null == order || order.length !== fields.length) {
      order = range(0, fields.length);
    }

    // Column division might be hard set by the user.
    var division = clone(User.details.overview_columns);
    if (
      !isArray(division) ||
      division.length !== columncount ||
      sum(division) !== fields.length
    ) {
      var height = Math.ceil(fields.length / columncount);
      division = map(
        trimEnd(repeat(height + '|', columncount), '|').split('|'),
        parseInt);
    }

    // Create grouped object.
    var obj = flow(
      partialRight(map, function(field) { // Add 'pos' attribute.
        field.pos = indexOf(order, field.field_id);
        field.pos = -1 !== field.pos ? field.pos : 0;
        return field;
      }),
      partialRight(sortBy, 'pos'), // Sort by position initially.
      partialRight(groupBy, function(field) { // Group intor columns.
        var col = field.pos % columncount;
        while (0 >= division[col]) {
          col = (col+1) % columncount;
          if (col === (field.pos % columncount)) { break; } // All full.
        }
        division[col] -= 1;
        return col;
      })
    )(fields);

    // Create column array from grouped object.
    columns = map(division, function(n, i) {
      return obj[i] || [];
    });

    return columns;
  }


  function refreshOrder(columns) {
    var columnheights = map(columns, 'length');
    var maxheight = max(columnheights);

    var order = [];
    for (var row = 0; row < maxheight; row++) {
      for (var col = 0; col < columns.length; col++) {
        if (row < columns[col].length) {
          order.push(columns[col][row].field_id);
        }
      }
    }

    User.details.one('regulations', User.details.regulation_id).customPUT({
      'overview_order': order,
      'overview_columns': columnheights
    });

    return order;
  }


  return {
    build: buildColumns,
    refresh: refreshOrder,
    breakpoints: breakpoints
  };
}




/* @ngInject */
function userIndexColumnsDirective($window, _, UserIndexColumns) {
  return {
    restrict: 'E',
    replace: false,
    scope: {
      fields: '=',
      courses: '='
    },
    templateUrl: 'components/user/overview/columns/columns.html',
    controller: function userIndexColumnsController() {},
    controllerAs: 'columns',
    bindToController: true,
    link: function(scope, elem, attrs, ctrl) {
      var columncount = null;

      function resize() {
        var width = $window.document.documentElement.clientWidth;
        var calc = partial(flow(add, Math.abs), (-1 * width));
        var points = map(UserIndexColumns.breakpoints, calc);
        var newColumncount = indexOf(points, min(points)) + 1;
        if (newColumncount !== columncount) {
          ctrl.set = UserIndexColumns.build(ctrl.fields, newColumncount);
          ctrl.sortable.active = (newColumncount >= 2);
          if (columncount !== null) {
            scope.$apply();
          }
          columncount = newColumncount;
        }
      }

      angular.element($window).bind('resize', resize);
      scope.$on('$destroy', function() {
        angular.element($window).unbind('resize', resize);
      });

      ctrl.sortable = {
        active: false,
        allow_cross: true,
        handle: '.panel-heading',
        stop: function() {
          var order = UserIndexColumns.refresh(ctrl.set);
          angular.forEach(ctrl.fields, function(field) {
            field.pos = order.indexOf(field.field_id);
          });
        }
      };

      // Initialize.
      resize();
    }
  };
}
