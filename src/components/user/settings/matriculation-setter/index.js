import angular from 'angular';
import { isUndefined, range, pick } from 'lodash-es';

import buttons from '../../../lib/buttons';
import icon from '../../../lib/icon';
import userService from '../../services/user';

import template from './matriculation-setter.html';


const userMatriculationSetterDirective = ['User', User => ({
  template,
  restrict: 'E',
  replace: true,
  scope: true,
  link: function matriculationSetterLink(scope, elem, attrs) {
    const d = new Date(), m = d.getMonth(), y = d.getFullYear();
    const currentYear = (m > 3) ? y : y - 1;
    scope.verifyButton = !isUndefined(attrs.verify);
    scope.years = range(currentYear, currentYear - 3, -1);
    scope.user = {
      mat_year: User.details.mat_year,
      mat_term: User.details.mat_term,
    };

    scope.$watchGroup(['user.mat_year', 'user.mat_term'], (n, o) => {
      if (n === o) { return; }
      const [mat_year, mat_term] = n;
      User.updateUser({ mat_year, mat_term }, true);
    });

    scope.verify = () => {
      scope.user.mat_verify = 1;
      User.updateUser(pick(scope.user,
        'mat_year',
        'mat_term',
        'mat_verify',
      ), true);
    };
  },
})];


/**
 * MODULE: spam.user.settings.matriculation-setter
 * DIRECTIVE: matriculation-setter
 */
export default angular
  .module('spam.user.settings.matriculation-setter', [
    buttons, userService, icon,
  ])
  .directive('matriculationSetter', userMatriculationSetterDirective)
  .name;
