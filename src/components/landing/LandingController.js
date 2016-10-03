export default class LandingController {
  static $inject = ['$scope', 'Restangular', 'User'];

  constructor($scope, Restangular, User) {
    this.stats = Restangular.one('/stats').get().$object;
    this.loginloading = false;
    $scope.$on('user-construct', this.userConstruct);
    this.userConstruct(null, User.details);
  }

  userConstruct(event, user) {
    if (!user) {
      this.loggedin = false;
      this.username = '';
    } else {
      this.loggedin = true;
      this.username = user.username;
    }
  }
}
