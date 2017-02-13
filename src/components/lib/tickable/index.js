import angular from 'angular';

import icon from '../icon';

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
  .module('tickable', [icon])
  .component('tickable', tickableComponent)
  .name;
