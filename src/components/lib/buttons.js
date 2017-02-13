import angular from 'angular';


function buttonsProvider() {
  this.defaults = {
    activeClass: 'active',
    toggleEvent: 'click',
  };

  this.$get = () => ({
    defaults: this.defaults,
  });
}


const checkboxButtonGroupDirective = () => ({
  restrict: 'A',
  require: 'ngModel',
  compile: function postLink(element, attr) {
    element.attr('data-toggle', 'buttons');
    element.removeAttr('ng-model');
    const children = element[0].querySelectorAll('input[type="checkbox"]');
    angular.forEach(children, child => {
      const childEl = angular.element(child);
      childEl.attr('checkbox-button', '');
      childEl.attr('ng-model', `${attr.ngModel}.${childEl.attr('value')}`);
    });
  },
});


const checkboxButtonDirective = ['Buttons', '$$rAF', (Buttons, $$rAF) => {
  const defaults = Buttons.defaults;
  const constantValueRegExp = /^(true|false|\d+)$/;

  return {
    restrict: 'A',
    require: 'ngModel',
    link: function postLink(scope, element, attr, controller) {
      const options = defaults;

      // Support label > input[type="checkbox"]
      const isInput = element[0].nodeName === 'INPUT';
      const activeElement = isInput ? element.parent() : element;

      let trueValue = angular.isDefined(attr.trueValue) ?
                      attr.trueValue : true;
      if (constantValueRegExp.test(attr.trueValue)) {
        trueValue = scope.$eval(attr.trueValue);
      }

      let falseValue = angular.isDefined(attr.falseValue) ?
                       attr.falseValue : false;
      if (constantValueRegExp.test(attr.falseValue)) {
        falseValue = scope.$eval(attr.falseValue);
      }

      const hasExoticValues = typeof trueValue !== 'boolean' ||
                              typeof falseValue !== 'boolean';
      if (hasExoticValues) {
        controller.$parsers.push(viewValue => (
          viewValue ? trueValue : falseValue
        ));

        controller.$formatters.push(modelValue => (
          angular.equals(modelValue, trueValue)
        ));

        scope.$watch(attr.ngModel, () => {
          controller.$render();
        });
      }

      controller.$render = () => {
        const isActive = angular.equals(controller.$modelValue, trueValue);
        $$rAF(() => {
          if (isInput) {
            element[0].checked = isActive;
          }

          activeElement.toggleClass(options.activeClass, isActive);
        });
      };

      // view -> model
      element.bind(options.toggleEvent, () => {
        scope.$apply(() => {
          if (!isInput) {
            controller.$setViewValue(!activeElement.hasClass('active'));
          }

          if (!hasExoticValues) {
            controller.$render();
          }
        });
      });
    },
  };
}];


const radioButtonGroupDirective = () => ({
  restrict: 'A',
  require: 'ngModel',
  compile: function postLink(element, attr) {
    element.attr('data-toggle', 'buttons');
    element.removeAttr('ng-model');
    const children = element[0].querySelectorAll('input[type="radio"]');
    angular.forEach(children, child => {
      angular.element(child).attr('radio-button', '');
      angular.element(child).attr('ng-model', attr.ngModel);
      if (attr.ngChange) {
        angular.element(child).attr('ng-change', attr.ngChange);
      }
    });
  },
});


const radioButtonDirective = ['Buttons', '$$rAF', (Buttons, $$rAF) => {
  const defaults = Buttons.defaults;
  const constantValueRegExp = /^(true|false|\d+)$/;

  return {
    restrict: 'A',
    require: 'ngModel',
    link: function postLink(scope, element, attr, controller) {
      const options = defaults;

      // Support `label > input[type="radio"]` markup
      const isInput = element[0].nodeName === 'INPUT';
      const activeElement = isInput ? element.parent() : element;

      let value;
      attr.$observe('value', v => {
        value = constantValueRegExp.test(v) ? scope.$eval(v) : v;
        controller.$render();
      });

      controller.$render = () => {
        const isActive = angular.equals(controller.$modelValue, value);
        $$rAF(() => {
          if (isInput) {
            element[0].checked = isActive;
          }

          activeElement.toggleClass(options.activeClass, isActive);
        });
      };

      element.bind(options.toggleEvent, () => {
        scope.$apply(() => {
          controller.$setViewValue(value);
          controller.$render();
        });
      });
    },
  };
}];


/**
 * MODULE: buttons
 * DIRECTIVES:
 *   checkboxButtonGroup
 *   checkboxButton
 *   radioButtonGroup
 *   radioButton
 * PROVIDER: ButtonsProvider
 */
export default angular
  .module('buttons', [])
  .provider('Buttons', buttonsProvider)
  .directive('checkboxButtonGroup', checkboxButtonGroupDirective)
  .directive('checkboxButton', checkboxButtonDirective)
  .directive('radioButtonGroup', radioButtonGroupDirective)
  .directive('radioButton', radioButtonDirective)
  .name;
