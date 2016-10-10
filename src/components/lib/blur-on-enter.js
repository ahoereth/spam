import angular from 'angular';


const blurOnEnterDirective = () => ({
  restrict: 'A',
  link: function blurOnEnterLink(scope, elem) {
    elem.on('keypress', $event => {
      if ($event.keyCode === 13) {
        $event.target.blur();
      }
    });
  },
});


/**
 * MODULE: blurOnEnter
 * DIRECTIVE: blurOnEnter
 *
 * Blur an input field on enter-keypress.
 */
export default angular
  .module('blurOnEnter', [])
  .directive('blurOnEnter', blurOnEnterDirective)
  .name;
