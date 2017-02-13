import pencil from '~/img/icons/pencil.svg';
import check from '~/img/icons/check.svg';
import close from '~/img/icons/close.svg';


const icons = { pencil, check, close };


export default class IconController {
  static $inject = ['$sce'];

  constructor($sce) {
    this.$sce = $sce;
  }

  $onInit() {
    this.icon = this.$sce.trustAsHtml(icons[this.i]);
  }
}
