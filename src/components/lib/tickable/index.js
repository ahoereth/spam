import angular from 'angular';

import TickableController from './TickableController';
import template from './tickable.html';
import './tickable.less';


const tickableComponent = {
  template,
  transclude: true,
  bindings: {
    model: '=ngModel',
    changeTarget: '&ngChange',
  },
  controller: TickableController,
};


/**
 * MODULE: tickable
 * COMPONENT: tickable
 */
export default angular
  .module('tickable', [])
  .component('tickable', tickableComponent)
  .name;
