import angular from 'angular';


function buttonsProvider() {
  this.defaults = {
    activeClass: 'active',
    toggleEvent: 'click'
  };

  this.$get = function() {
    return {
      defaults: this.defaults
    };
  };
}


function checkboxButtonGroupDirective() {
  return {
    restrict: 'A',
    require: 'ngModel',
    compile: function postLink(element, attr) {
      element.attr('data-toggle', 'buttons');
      element.removeAttr('ng-model');
      var children = element[0].querySelectorAll('input[type="checkbox"]');
      angular.forEach(children, function(child) {
        var childEl = angular.element(child);
        childEl.attr('checkbox-button', '');
        childEl.attr('ng-model', attr.ngModel + '.' + childEl.attr('value'));
      });
    }
  };
}


const checkboxButtonDirective = ['Buttons', '$$rAF', (Buttons, $$rAF) => {
  var defaults = Buttons.defaults;
  var constantValueRegExp = /^(true|false|\d+)$/;

  return {
    restrict: 'A',
    require: 'ngModel',
    link: function postLink(scope, element, attr, controller) {
      var options = defaults;

      // Support label > input[type="checkbox"]
      var isInput = element[0].nodeName === 'INPUT';
      var activeElement = isInput ? element.parent() : element;

      var trueValue = angular.isDefined(attr.trueValue) ?
                      attr.trueValue : true;
      if (constantValueRegExp.test(attr.trueValue)) {
        trueValue = scope.$eval(attr.trueValue);
      }

      var falseValue = angular.isDefined(attr.falseValue) ?
                       attr.falseValue : false;
      if (constantValueRegExp.test(attr.falseValue)) {
        falseValue = scope.$eval(attr.falseValue);
      }

      var hasExoticValues = typeof  trueValue !== 'boolean' ||
                            typeof falseValue !== 'boolean';
      if (hasExoticValues) {
        controller.$parsers.push(function(viewValue) {
          return viewValue ? trueValue : falseValue;
        });

        controller.$formatters.push(function(modelValue) {
           return angular.equals(modelValue, trueValue);
        });

        scope.$watch(attr.ngModel, function(/*newValue, oldValue*/) {
          controller.$render();
        });
      }

      controller.$render = function() {
        var isActive = angular.equals(controller.$modelValue, trueValue);
        $$rAF(function() {
          if (isInput) {
            element[0].checked = isActive;
          }

          activeElement.toggleClass(options.activeClass, isActive);
        });
      };

      // view -> model
      element.bind(options.toggleEvent, function() {
        scope.$apply(function () {
          if (!isInput) {
            controller.$setViewValue(!activeElement.hasClass('active'));
          }

          if (!hasExoticValues) {
            controller.$render();
          }
        });
      });
    }
  };
}];


function radioButtonGroupDirective() {
  return {
    restrict: 'A',
    require: 'ngModel',
    compile: function postLink(element, attr) {
      element.attr('data-toggle', 'buttons');
      element.removeAttr('ng-model');
      var children = element[0].querySelectorAll('input[type="radio"]');
      angular.forEach(children, function(child) {
        angular.element(child).attr('radio-button', '');
        angular.element(child).attr('ng-model', attr.ngModel);
      });
    }
  };
}


const radioButtonDirective = ['Buttons', '$$rAF', (Buttons, $$rAF) => {
  var defaults = Buttons.defaults;
  var constantValueRegExp = /^(true|false|\d+)$/;

  return {
    restrict: 'A',
    require: 'ngModel',
    link: function postLink(scope, element, attr, controller) {
      var options = defaults;

      // Support `label > input[type="radio"]` markup
      var isInput = element[0].nodeName === 'INPUT';
      var activeElement = isInput ? element.parent() : element;

      var value;
      attr.$observe('value', function(v) {
        value = constantValueRegExp.test(v) ? scope.$eval(v) : v;
        controller.$render();
      });

      controller.$render = function () {
        var isActive = angular.equals(controller.$modelValue, value);
        $$rAF(function() {
          if (isInput) {
            element[0].checked = isActive;
          }

          activeElement.toggleClass(options.activeClass, isActive);
        });
      };

      element.bind(options.toggleEvent, function() {
        scope.$apply(function () {
          controller.$setViewValue(value);
          controller.$render();
        });
      });
    }
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
