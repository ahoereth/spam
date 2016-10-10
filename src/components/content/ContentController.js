import { kebabCase, extend } from 'lodash-es';

import '../lib/scroll';


export default class ContentController {
  static $inject = ['$scope', '$location', '$window', '$document', 'Scroll'];

  constructor($scope, $location, $window, $document, Scroll) {
    let currentRouteName;
    let classnames = {};

    function updateContentClass(e, classnamesSet) {
      let name = kebabCase($location.path().replace('~', 'user'));
      name = name || 'root';
      if (currentRouteName !== name) {
        classnames = {};
        currentRouteName = name;
        classnames[name] = true;
      }

      if (e && e.name === 'content-classname') {
        classnames = extend(classnames, classnamesSet);
      }

      this.classnames = classnames;
    }

    $scope.$on('$locationChangeStart', updateContentClass);
    $scope.$on('content-classname', updateContentClass);
    updateContentClass();

    Scroll.addListener(() => {
      const clientHeight = Scroll.getClientHeight();
      const scrolled = Scroll.getScrolledDistance();
      const bottom = clientHeight + scrolled;
      const bodyHeight = $document[0].body.clientHeight + 20; // + body padding
      updateContentClass({ name: 'content-classname' }, {
        scrolled: Scroll.getScrollDistance > 50,
        'scroll-bottom': bottom >= bodyHeight,
        'second-page': scrolled > clientHeight,
        'third-page': scrolled > (clientHeight * 2),
      });
    });
  }
}
