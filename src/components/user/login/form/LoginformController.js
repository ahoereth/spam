export default class LoginformController {
  static $inject = ['$location', '$routeParams', 'Auth'];

  constructor($location, $routeParams, Auth) {
    this.$location = $location;
    this.$routeParams = $routeParams;
    this.Auth = Auth;
  }

  $onInit() {
    if (!this.username) {
      this.username = this.$routeParams.username || '';
    }
  }

  login() {
    const params = this.$routeParams;
    const location = this.$location;
    this.Auth.init(this.username, this.password, this.remember)
      .then(() => location.path(params.path || '/~').search({}))
      .catch(() => location.path('/login').search({ username: this.username }));
  }
}
