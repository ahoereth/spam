import { kebabCase, extend } from 'lodash-es';

import '../lib/scroll';


/* @ngInject */
export default (
  $scope,
  $location,
  $window,
  $document,
  Scroll
) => {
  var currentRouteName;
  var classnames = {};

  function updateContentClass(e, classnamesSet) {
    var name = kebabCase($location.path().replace('~', 'user'));
    name = name ? name : 'root';
    if (currentRouteName !== name) {
      classnames = {};
      currentRouteName = name;
      classnames[name] = true;
    }

    if (e && 'content-classname' === e.name) {
      classnames = extend(classnames, classnamesSet);
    }

    this.classnames = classnames;
  }

  $scope.$on('$locationChangeStart', updateContentClass);
  $scope.$on('content-classname', updateContentClass);
  updateContentClass();

  Scroll.addListener(function() {
    var clientHeight = Scroll.getClientHeight();
    var scrolled = Scroll.getScrolledDistance();
    var bottom = clientHeight + scrolled;
    var bodyHeight = $document[0].body.clientHeight+20; // +body padding
    updateContentClass({name: 'content-classname'}, {
      'scrolled': Scroll.getScrollDistance > 50,
      'scroll-bottom': bottom >= bodyHeight,
      'second-page': scrolled > clientHeight,
      'third-page': scrolled > (clientHeight * 2),
    });
  });
};
