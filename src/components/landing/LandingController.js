export default class LandingController {
  static $inject = ['$scope', 'Restangular', 'User'];

  constructor($scope, Restangular, User) {
    this.stats = Restangular.one('/stats').get().$object;
    this.loginloading = false;
    $scope.$on('user-construct', (e, user) => this.userConstruct(user));
    this.userConstruct(User.details);
  }

  userConstruct(user = {}) {
    if (!user.username) {
      this.loggedin = false;
      this.username = '';
    } else {
      this.loggedin = true;
      this.username = user.username;
    }
  }
}
