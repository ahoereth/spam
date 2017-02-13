import angular from 'angular';

import buttons from '~/components/lib/buttons';
import icon from '~/components/lib/icon';
import userService from '../../services/user';

import controller from './MatriculationSetterController';
import template from './matriculation-setter.html';


/**
 * MODULE: spam.user.settings.matriculation-setter
 * COMPONENT: matriculation-setter
 */
export default angular
  .module('spam.user.settings.matriculation-setter', [
    buttons, userService, icon,
  ])
  .component('matriculationSetter', {
    template,
    controller,
    bindings: { verify: '@' },
  })
  .name;
