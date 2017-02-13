import angular from 'angular';

import InlineSelectableGroupController from './InlineSelectableGroupController';
import InlineSelectableController from './InlineSelectableController';
import template from './inline-selectable.html';
import './inline-selectables.css';


/**
 * MODULE: inlineSelectables
 * COMPONENTS:
 *   inlineSelectableGroup
 *   inlineSelectable
 */
export default angular
  .module('inlineSelectables', [])
  .component('inlineSelectableGroup', {
    controller: InlineSelectableGroupController,
    restrict: 'E',
    bindings: { value: '=ngModel' },
  })
  .component('inlineSelectable', {
    template,
    controller: InlineSelectableController,
    transclude: true,
    bindings: { value: '@' },
    require: { group: '^^inlineSelectableGroup' },
  })
  .name;
