import angular from 'angular';

import controller from './DropdownController';
import './dropdown.css';


const dropdownService = ['$document', function dropdownService($document) {
  var openScope = null;

  this.open = function(dropdownScope) {
    if (! openScope) {
      $document.bind('click', closeDropdown);
      $document.bind('keydown', escapeKeyBind);
    }

    if (openScope && openScope !== dropdownScope) {
      openScope.isOpen = false;
    }

    openScope = dropdownScope;
  };

  this.close = function(dropdownScope) {
    if (openScope === dropdownScope) {
      openScope = null;
      $document.unbind('click', closeDropdown);
      $document.unbind('keydown', escapeKeyBind);
    }
  };

  var closeDropdown = function(e) {
    // This method may still be called during the same mouse event that
    // unbound this event handler. So check openScope before proceeding.
    if (! openScope) { return; }

    var toggleElement = openScope.getToggleElement();
    if (e && toggleElement && toggleElement[0].contains(e.target)) {
      return;
    }

    openScope.$apply(function() {
      openScope.isOpen = false;
    });
  };

  var escapeKeyBind = function(e) {
    if (e.which === 27) {
      openScope.focusToggleElement();
      closeDropdown();
    }
  };
}];


const dropdownDirective = () => ({
  controller,
  link: function(scope, element, attrs, dropdownController) {
    dropdownController.init(element);
  }
});


const dropdownToggleDirective = () => ({
  require: '^^dropdown',
  link: function(scope, element, attrs, dropdownController) {
  //  if (! dropdownController) { return; }
    dropdownController.toggleElement = element;

    var toggleDropdown = function(event) {
      event.preventDefault();

      if (! element.hasClass('disabled') && ! attrs.disabled) {
        scope.$apply(function() {
          dropdownController.toggle();
        });
      }
    };

    element.bind('click', toggleDropdown);

    scope.$on('$destroy', function() {
      element.unbind('click', toggleDropdown);
    });
  }
});


/**
 * MODULE: dropdown
 * DIRECTIVES:
 *   dropdown
 *   dropdownToggle
 * SERVICE: DropdownService
 *
 * @see https://github.com/angular-ui/bootstrap
 */
export default angular.module('dropdown', [])
  .service('DropdownService', dropdownService)
  .directive('dropdown', dropdownDirective)
  .directive('dropdownToggle', dropdownToggleDirective)
  .name;
