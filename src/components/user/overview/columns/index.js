import angular from 'angular';
import {
  range, clone, isArray, sum, map, trimEnd, repeat, parseInt,
  indexOf, max, partial, flow, add, min, partialRight, groupBy, sortBy,
} from 'lodash-es';

import sortable from '../../../lib/sortable';
import userService from '../../services/user';
import field from '../field';
import course from '../course';

import template from './columns.html';
import './columns.less';


const userOverviewColumnsFactory = ['$window', 'User', ($window, User) => {
  const breakpoints = [750, 970, 1170];


  function buildColumns(fields, columncount) {
    columncount = columncount || 3;

    // Order might be set by the user.
    let order = User.details.overview_order;
    if (order == null || order.length !== fields.length) {
      order = range(0, fields.length);
    }

    // Column division might be hard set by the user.
    let division = clone(User.details.overview_columns);
    if (
      !isArray(division) ||
      division.length !== columncount ||
      sum(division) !== fields.length
    ) {
      const height = Math.ceil(fields.length / columncount);
      division = map(
        trimEnd(repeat(`${height}|${columncount}`), '|').split('|'),
        parseInt);
    }

    // Create grouped object.
    const obj = flow(
      partialRight(map, f => { // Add 'pos' attribute.
        f.pos = indexOf(order, f.field_id);
        f.pos = f.pos !== -1 ? field.pos : 0;
        return f;
      }),
      partialRight(sortBy, 'pos'), // Sort by position initially.
      partialRight(groupBy, f => { // Group intor columns.
        let col = f.pos % columncount;
        while (division[col] <= 0) {
          col = (col + 1) % columncount;
          if (col === (f.pos % columncount)) { break; } // All full.
        }
        division[col] -= 1;
        return col;
      })
    )(fields);

    // Create column array from grouped object.
    return map(division, (n, i) => obj[i] || []);
  }


  function refreshOrder(columns) {
    const columnheights = map(columns, 'length');
    const maxheight = max(columnheights);

    const order = [];
    for (let row = 0; row < maxheight; row++) {
      for (let col = 0; col < columns.length; col++) {
        if (row < columns[col].length) {
          order.push(columns[col][row].field_id);
        }
      }
    }

    User.details.one('regulations', User.details.regulation_id).customPUT({
      overview_order: order,
      overview_columns: columnheights,
    });

    return order;
  }


  return {
    breakpoints,
    build: buildColumns,
    refresh: refreshOrder,
  };
}];


const userOverviewColumnsDirective = [
  '$window', 'UserOverviewColumns',
  function userOverviewColumnsDirective($window, UserOverviewColumns) {
    return {
      template,
      restrict: 'E',
      replace: false,
      scope: {
        fields: '=',
        courses: '=',
      },
      controller: function userOverviewColumnsController() {},
      controllerAs: 'columns',
      bindToController: true,
      link: function userOverviewColumnsLink(scope, elem, attrs, ctrl) {
        let columncount = null;

        function resize() {
          const width = $window.document.documentElement.clientWidth;
          const calc = partial(flow(add, Math.abs), (-1 * width));
          const points = map(UserOverviewColumns.breakpoints, calc);
          const newColumncount = indexOf(points, min(points)) + 1;
          if (newColumncount !== columncount) {
            ctrl.set = UserOverviewColumns.build(ctrl.fields, newColumncount);
            ctrl.sortable.active = (newColumncount >= 2);
            if (columncount !== null) {
              scope.$apply();
            }
            columncount = newColumncount;
          }
        }

        angular.element($window).bind('resize', resize);
        scope.$on('$destroy', () => {
          angular.element($window).unbind('resize', resize);
        });

        ctrl.sortable = {
          active: false,
          allow_cross: true,
          handle: '.panel-heading',
          stop: () => {
            const order = UserOverviewColumns.refresh(ctrl.set);
            angular.forEach(ctrl.fields, f => {
              f.pos = indexOf(order, f.field_id);
            });
          },
        };

        // Initialize.
        resize();
      },
    };
  },
];


/**
 * MODULE: spam.user.overview.columns
 * DIRECTIVE overviewColumns
 * FACTORY: UserOverviewColumns
 */
export default angular
  .module('spam.user.overview.columns', [sortable, userService, field, course])
  .directive('overviewColumns', userOverviewColumnsDirective)
  .factory('UserOverviewColumns', userOverviewColumnsFactory)
  .name;
