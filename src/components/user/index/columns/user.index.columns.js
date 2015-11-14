(function () {
  'use strict';

  /**
   * MODULE: spam.user.index.field
   * DIRECTIVE: field
   * CONTROLLER: UserIndexFieldController
   */
  angular
    .module('spam.user.index.columns', [
      'lodash',
      'sortable',
      'spam.user.services.user',
      'spam.user.index.field',
      'spam.user.index.course'
    ])
    .directive('overviewColumns', userIndexColumnsDirective)
    .factory('UserIndexColumns', userIndexColumnsFactory);




  /* @ngInject */
  function userIndexColumnsFactory(
    $window,
    _,
    User
  ) {
    var breakpoints = [750, 970, 1170];
    var columns;


    function buildColumns(fields, columncount) {
      columncount = columncount || 3;

      // Order might be set by the user.
      var order = User.details.overview_order;
      if (null == order || order.length !== fields.length) {
        order = _.range(0, fields.length);
      }

      // Column division might be hard set by the user.
      var division = _.clone(User.details.overview_columns);
      if (
        !_.isArray(division) ||
        division.length !== columncount ||
        _.sum(division) !== fields.length
      ) {
        var height = Math.ceil(fields.length / columncount);
        division = _.map(
          _.trimRight(_.repeat(height + '|', columncount), '|').split('|'),
          _.parseInt);
      }

      // Create grouped object.
      var obj = _(fields)
        .map(function(field) { // Add 'pos' attribute.
          field.pos = _.indexOf(order, field.field_id);
          field.pos = -1 !== field.pos ? field.pos : 0;
          return field;
        })
        .sortBy('pos') // Sort by position initially.
        .groupBy(function(field) { // Group intor columns.
          var col = field.pos % columncount;
          while (0 >= division[col]) {
            col = (col+1) % columncount;
            if (col === (field.pos % columncount)) { break; } // All full.
          }
          division[col] -= 1;
          return col;
        })
        .value();

      // Create column array from grouped object.
      columns = _.map(division, function(n, i) {
        return obj[i] || [];
      });

      return columns;
    }


    function refreshOrder(columns) {
      var columnheights = _.map(columns, 'length');
      var maxheight = _.max(columnheights);

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
      templateUrl: 'components/user/index/columns/user.index.columns.html',
      controller: function userIndexColumnsController() {},
      controllerAs: 'columns',
      bindToController: true,
      link: function(scope) {
        var ctrl = scope.columns;
        var columncount = null;

        function resize() {
          var width = $window.document.documentElement.clientWidth;
          var calc = _.partial(_.flow(_.add, Math.abs), (-1 * width));
          var points = _.map(UserIndexColumns.breakpoints, calc);
          var newColumncount = _.indexOf(points, _.min(points)) + 1;
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

})();
