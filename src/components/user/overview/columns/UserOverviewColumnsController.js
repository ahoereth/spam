import angular from 'angular';
import {
  map, isNull, forEach, indexOf, partial, flow, add, min, assign,
} from 'lodash-es';


export default class UserOverviewColumnsController {
  static $inject = ['$scope', '$window', 'UserOverviewColumns'];

  constructor($scope, $window, UserOverviewColumns) {
    this.$scope = $scope;
    this.$window = $window;
    this.UserOverviewColumns = UserOverviewColumns;
  }

  $onInit() {
    assign(this, {
      columncount: null,
      sortable: {
        active: false,
        allow_cross: true,
        handle: '.panel-heading',
        stop: () => {
          const order = this.UserOverviewColumns.refresh(this.set);
          forEach(this.fields, f => { f.pos = indexOf(order, f.field_id); });
        },
      },
    });

    const resize = () => this.resize();
    angular.element(this.$window).bind('resize', resize);
    this.$scope.$on('$destroy', () => {
      angular.element(this.$window).unbind('resize', resize);
    });

    this.resize();
  }

  resize() {
    const width = this.$window.document.documentElement.clientWidth;
    const calc = partial(flow(add, Math.abs), (-1 * width));
    const points = map(this.UserOverviewColumns.breakpoints, calc);
    const newColumncount = indexOf(points, min(points)) + 1;
    if (newColumncount !== this.columncount) {
      this.set = this.UserOverviewColumns.build(this.fields, newColumncount);
      this.sortable.active = (newColumncount >= 2);
      if (!isNull(this.columncount)) {
        this.$scope.$apply();
      }
      this.columncount = newColumncount;
    }
  }
}
