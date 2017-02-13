import angular from 'angular';

import './icon.less';


/**
 * MODULE: icon
 * DIRECTIVE: icon
 */
export default angular
  .module('icon', [])
  .config(['$sceDelegateProvider', function allowsrc($sceDelegateProvider) {
    const whitelist = $sceDelegateProvider.resourceUrlWhitelist();
    whitelist.push('data:image/svg+xml;base64,**');
    whitelist.push('data:image/svg+xml;charset=utf8,**');
    $sceDelegateProvider.resourceUrlWhitelist(whitelist);
  }])
  .component('icon', {
    template: '<img class="icon" ng-src="{{$ctrl.i}}">',
    bindings: {
      i: '<',
    },
  })
  .name;
