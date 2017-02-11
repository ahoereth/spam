export default class TickableController {
  static $inject = ['$timeout'];

  constructor($timeout) {
    this.$timeout = $timeout;
  }

  change() {
    this.$timeout(() => this.changeTarget(this), 0);
  }
}
