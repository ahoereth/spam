import { range, pick } from 'lodash-es';


export default class MatriculationSetterController {
  static $inject = ['User'];

  constructor(User) {
    this.User = User;
  }

  $onInit() {
    const d = new Date(), m = d.getMonth(), y = d.getFullYear();
    const currentYear = (m > 3) ? y : y - 1;
    this.years = range(currentYear, currentYear - 3, -1);
    this.user = pick(this.User.details, 'mat_year', 'mat_term', 'mat_verify');
  }

  change() {
    this.User.updateUser(pick(this.user,
      'mat_year',
      'mat_term',
      'mat_verify',
    ));
  }

  doVerify() {
    this.user.mat_verify = 1;
    this.User.updateUser(pick(this.user,
      'mat_year',
      'mat_term',
      'mat_verify',
    ));
  }
}
