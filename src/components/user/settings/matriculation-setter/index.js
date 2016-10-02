import angular from 'angular';
import { isUndefined, range, pick } from 'lodash-es';

import buttons from '../../../lib/buttons';
import userService from '../../services/user';


/**
 * MODULE: spam.user.settings.matriculation-setter
 * DIRECTIVE: matriculation-setter
 */
export default angular
  .module('spam.user.settings.matriculation-setter', [buttons, userService])
  .directive('matriculationSetter', userMatriculationSetterDirective)
  .name;




/* @ngInject */
function userMatriculationSetterDirective(User) {
  return {
    restrict: 'E',
    replace: true,
    scope: true,
    templateUrl: 'components/user/settings/matriculation-setter/matriculation-setter.html',
    link: function(scope, elem, attrs) {
      var d = new Date(), m = d.getMonth(), y = d.getFullYear();
      var currentYear = (m > 3) ? y : y - 1;
      scope.verifyButton = ! isUndefined(attrs.verify);
      scope.years = range(currentYear, currentYear - 3, -1);
      scope.user = {
        mat_year: User.details.mat_year,
        mat_term: User.details.mat_term,
      };

      scope.$watchGroup(['user.mat_year', 'user.mat_term'], function(n, o) {
        if (n === o) { return; }

        User.updateUser({
          mat_year: n[0],
          mat_term: n[1]
        }, true);
      });

      scope.verify = function() {
        scope.user.mat_verify = 1;
        User.updateUser(pick(scope.user,
          'mat_year',
          'mat_term',
          'mat_verify'
        ), true);
      };
    }
  };
}