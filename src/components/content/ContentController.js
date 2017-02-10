import { kebabCase, assign } from 'lodash-es';

import '../lib/scroll';


export default class ContentController {
  static $inject = ['$scope', '$location', '$window', '$document', 'Scroll'];

  constructor($scope, $location, $window, $document, Scroll) {
    assign(this, {
      $location, Scroll, $document,
      classnames: {},
      currentRouteName: undefined,
    });

    $scope.$on('$locationChangeStart', (e, n) => this.updateContentClass(e, n));
    $scope.$on('content-classname', (e, n) => this.updateContentClass(e, n));
    this.updateContentClass();

    Scroll.addListener(() => this.scrollListener());
  }

  updateContentClass(e, classnamesSet) {
    let name = kebabCase(this.$location.path().replace('~', 'user'));
    name = name || 'root';
    if (this.currentRouteName !== name) {
      this.classnames = { [name]: true };
      this.currentRouteName = name;
    }

    if (e && e.name === 'content-classname') {
      this.classnames = { ...this.classnames, ...classnamesSet };
    }
  }

  scrollListener() {
    const clientHeight = this.Scroll.getClientHeight();
    const scrolled = this.Scroll.getScrolledDistance();
    const bottom = clientHeight + scrolled;
    const bodyHeight = this.$document[0].body.clientHeight + 20; // + body padding
    this.updateContentClass({ name: 'content-classname' }, {
      scrolled: this.Scroll.getScrollDistance > 50,
      'scroll-bottom': bottom >= bodyHeight,
      'second-page': scrolled > clientHeight,
      'third-page': scrolled > (clientHeight * 2),
    });
  }
}
