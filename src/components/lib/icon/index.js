import angular from 'angular';
import ngSanitize from 'angular-sanitize';

import IconController from './IconController';
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
    controller: IconController,
    template: '<span class="icon" ng-bind-html="::$ctrl.icon"></span>',
    bindings: {
      i: '@',
    },
  })
  .name;
