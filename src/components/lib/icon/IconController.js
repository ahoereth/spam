import pencil from '~/img/icons/pencil.svg';
import check from '~/img/icons/check.svg';
import close from '~/img/icons/close.svg';
import refresh from '~/img/icons/refresh.svg';
import plus from '~/img/icons/plus.svg';
import minus from '~/img/icons/minus.svg';
import download from '~/img/icons/download.svg';
import chevron_right from '~/img/icons/chevron-right.svg';
import chevron_down from '~/img/icons/chevron-down.svg';
import check_circle from '~/img/icons/check-circle-o.svg';


const icons = {
  pencil, check, close, refresh, plus, minus, download,
  'chevron-right': chevron_right,
  'chevron-down': chevron_down,
  'check-circle': check_circle,
};


export default class IconController {
  static $inject = ['$sce'];

  constructor($sce) {
    this.$sce = $sce;
  }

  $onInit() {
    this.icon = this.$sce.trustAsHtml(icons[this.i]);
  }
}
