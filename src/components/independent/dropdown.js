(function() {
  'use strict';

  /**
   * @see https://github.com/angular-ui/bootstrap
   */
  angular.module('dropdown', [])
    .service('DropdownService', dropdownService)
    .controller('DropdownCtrl', dropdownCtrl)
    .directive('dropdown', dropdownDirective)
    .directive('dropdownToggle', dropdownToggleDirective);


  /* @ngInject */
  function dropdownService($document) {
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
  }


  /* @ngInject */
  function dropdownCtrl(
    $scope,
    $attrs,
    $parse,
    DropdownService,
    $animate
  ) {
    var self = this,
        scope = $scope.$new(),
        openClass = 'open',
        getIsOpen,
        setIsOpen = angular.noop,
        toggleInvoker = $attrs.onToggle ? $parse($attrs.onToggle) : angular.noop;

    this.init = function(element) {
      self.$element = element;

      if ($attrs.isOpen) {
        getIsOpen = $parse($attrs.isOpen);
        setIsOpen = getIsOpen.assign;

        $scope.$watch(getIsOpen, function(value) {
          scope.isOpen = !!value;
        });
      }
    };

    this.toggle = function(open) {
      return scope.isOpen = arguments.length ? !!open : !scope.isOpen;
    };

    // Allow other directives to watch status
    this.isOpen = function() {
      return scope.isOpen;
    };

    scope.getToggleElement = function() {
      return self.toggleElement;
    };

    scope.focusToggleElement = function() {
      if (self.toggleElement) {
        self.toggleElement[0].focus();
      }
    };

    scope.$watch('isOpen', function(isOpen, wasOpen) {
      $animate[isOpen ? 'addClass' : 'removeClass'](self.$element, openClass);

      if (isOpen) {
        scope.focusToggleElement();
        DropdownService.open( scope );
      } else {
        DropdownService.close( scope );
      }

      setIsOpen($scope, isOpen);
      if (angular.isDefined(isOpen) && isOpen !== wasOpen) {
        toggleInvoker($scope, { open: !!isOpen });
      }
    });

    $scope.$on('$locationChangeSuccess', function() {
      scope.isOpen = false;
    });

    $scope.$on('$destroy', function() {
      scope.$destroy();
    });
  }


  function dropdownDirective() {
    return {
      controller: 'DropdownCtrl',
      link: function(scope, element, attrs, dropdownCtrl) {
        dropdownCtrl.init(element);
      }
    };
  }

  function dropdownToggleDirective() {
    return {
      require: '^^dropdown',
      link: function(scope, element, attrs, dropdownCtrl) {
      //  if (! dropdownCtrl) { return; }
        dropdownCtrl.toggleElement = element;

        var toggleDropdown = function(event) {
          event.preventDefault();

          if (! element.hasClass('disabled') && ! attrs.disabled) {
            scope.$apply(function() {
              dropdownCtrl.toggle();
            });
          }
        };

        element.bind('click', toggleDropdown);

        scope.$on('$destroy', function() {
          element.unbind('click', toggleDropdown);
        });
      }
    };
  }

})();
