import angular from 'angular';
import ngSanitize from 'angular-sanitize';

import 'svg-icon/dist/svg/bootstrap/pencil.svg';
import 'svg-icon/dist/svg/bootstrap/ok.svg';
import 'svg-icon/dist/svg/bootstrap/remove.svg';
import 'svg-icon/dist/svg/bootstrap/refresh.svg';
import 'svg-icon/dist/svg/bootstrap/plus.svg';
import 'svg-icon/dist/svg/bootstrap/minus.svg';
import 'svg-icon/dist/svg/bootstrap/download.svg';
import 'svg-icon/dist/svg/bootstrap/chevron-right.svg';
import 'svg-icon/dist/svg/bootstrap/chevron-down.svg';
import 'svg-icon/dist/svg/bootstrap/saved.svg';
import 'svg-icon/dist/svg/bootstrap/heart.svg';

import './icon.less';


/**
 * MODULE: icon
 * DIRECTIVE: icon
 */
export default angular
  .module('icon', [ngSanitize])
  .config(['$sceDelegateProvider', function allowsrc($sceDelegateProvider) {
    const whitelist = $sceDelegateProvider.resourceUrlWhitelist();
    whitelist.push('data:image/svg+xml;base64,**');
    whitelist.push('data:image/svg+xml;charset=utf8,**');
    $sceDelegateProvider.resourceUrlWhitelist(whitelist);
  }])
  .component('icon', {
    controller: function IconController() {
      this.$onInit = function $onInit() {
        this.icon = `#${this.i}`;
      };
    },
    template: '<svg class="icon"><use xlink:href="{{::$ctrl.icon}}" /></svg>',
    bindings: {
      i: '@',
    },
  })
  .name;
