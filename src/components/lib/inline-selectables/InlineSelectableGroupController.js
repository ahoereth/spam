import angular from 'angular';


export default class InlineSelectableGroupController {
  $onInit() {
    this.watchers = [];
  }

  setValue(value) {
    this.value = value;
    angular.forEach(this.watchers, watcher => watcher(value));
  }

  addWatcher(watcher) {
    this.watchers.push(watcher);
    watcher(this.value);
  }
}
