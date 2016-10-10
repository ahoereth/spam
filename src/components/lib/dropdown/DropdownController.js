import { isUndefined, assign } from 'lodash-es';


export default class DropdownController {
  static $inject = [
    '$scope', '$attrs', '$parse', 'DropdownService', '$animate',
  ];

  // TODO: split into instance methods and controller as style
  constructor($scope, $attrs, $parse, DropdownService, $animate) {
    const self = this;
    assign(this, {
      $attrs,
      $scope,
      $parse,
      scope: $scope.$new(),
      getIsOpen: undefined,
      setIsOpen: () => {},
    });
    const openClass = 'open';
    const toggleInvoker = $attrs.onToggle ? $parse($attrs.onToggle) : () => {};

    this.scope.getToggleElement = () => this.toggleElement;

    this.scope.focusToggleElement = () => {
      if (this.toggleElement) {
        this.toggleElement[0].focus();
      }
    };

    this.scope.$watch('isOpen', (isOpen, wasOpen) => {
      $animate[isOpen ? 'addClass' : 'removeClass'](self.$element, openClass);

      if (isOpen) {
        this.scope.focusToggleElement();
        DropdownService.open(this.scope);
      } else {
        DropdownService.close(this.scope);
      }

      this.setIsOpen(this.$scope, isOpen);
      if (!isUndefined(isOpen) && isOpen !== wasOpen) {
        toggleInvoker($scope, { open: !!isOpen });
      }
    });

    this.$scope.$on('$locationChangeSuccess', () => {
      this.scope.isOpen = false;
    });

    this.$scope.$on('$destroy', () => {
      this.scope.$destroy();
    });
  }

  init(element) {
    this.$element = element;

    if (this.$attrs.isOpen) {
      this.getIsOpen = this.$parse(this.$attrs.isOpen);
      this.setIsOpen = this.getIsOpen.assign;
      this.$scope.$watch(this.getIsOpen, value => {
        this.scope.isOpen = !!value;
      });
    }
  }

  toggle(open) {
    this.scope.isOpen = arguments.length ? !!open : !this.scope.isOpen;
    return this.scope.isOpen;
  }

  // Allow other directives to watch status
  isOpen() {
    return this.scope.isOpen;
  }
}
