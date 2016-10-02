import angular from 'angular';
import ngRoute from 'angular-route';

import scroll from '../lib/scroll';
import controller from './content.controller';
import notifications from '../notifications';


/**
 * MODULE: spam.content
 * DIRECTIVE: content
 * CONTROLLER: ContentController
 */
export default angular
  .module('spam.content', [ngRoute, scroll, notifications])
  .directive('content', contentDirective) // TODO: convert to component
  .controller('ContentController', controller)
  .name;




/* @ngInject */
function contentDirective() {
  return {
    restrict: 'E',
    replace: true,
    scope: true,
    templateUrl: 'components/content/content.html',
    controller: 'ContentController',
    controllerAs: 'content'
  };
}
