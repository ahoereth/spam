export default class InlineSelectableController {
  $onInit() {
    this.group.addWatcher(val => this.outerChange(val));
  }

  change() {
    this.group.setValue(this.value);
  }

  outerChange(value) {
    this.groupVal = value;
  }
}
