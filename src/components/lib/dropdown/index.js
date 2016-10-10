import angular from 'angular';

import controller from './DropdownController';
import './dropdown.css';


const dropdownService = ['$document', function dropdownService($document) {
  let openScope = null;

  const closeDropdown = e => {
    // This method may still be called during the same mouse event that
    // unbound this event handler. So check openScope before proceeding.
    if (!openScope) { return; }

    const toggleElement = openScope.getToggleElement();
    if (e && toggleElement && toggleElement[0].contains(e.target)) {
      return;
    }

    openScope.$apply(() => {
      openScope.isOpen = false;
    });
  };

  const escapeKeyBind = e => {
    if (e.which === 27) {
      openScope.focusToggleElement();
      closeDropdown();
    }
  };

  this.open = dropdownScope => {
    if (!openScope) {
      $document.bind('click', closeDropdown);
      $document.bind('keydown', escapeKeyBind);
    }

    if (openScope && openScope !== dropdownScope) {
      openScope.isOpen = false;
    }

    openScope = dropdownScope;
  };

  this.close = dropdownScope => {
    if (openScope === dropdownScope) {
      openScope = null;
      $document.unbind('click', closeDropdown);
      $document.unbind('keydown', escapeKeyBind);
    }
  };
}];


const dropdownDirective = () => ({
  controller,
  link: function dropdownLink(scope, element, attrs, dropdownController) {
    dropdownController.init(element);
  },
});


const dropdownToggleDirective = () => ({
  require: '^^dropdown',
  link: function dropdownToggleLink(scope, element, attrs, dropdownController) {
  //  if (! dropdownController) { return; }
    dropdownController.toggleElement = element;

    const toggleDropdown = event => {
      event.preventDefault();

      if (!element.hasClass('disabled') && !attrs.disabled) {
        scope.$apply(() => {
          dropdownController.toggle();
        });
      }
    };

    element.bind('click', toggleDropdown);

    scope.$on('$destroy', () => {
      element.unbind('click', toggleDropdown);
    });
  },
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
