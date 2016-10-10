export default class FooterController {
  static $inject = ['$scope'];

  constructor($scope) {
    $scope.$on('user-construct', (e, user) => this.userConstruct(user));
    this.userConstruct();
  }

  userConstruct(user) {
    this.user = !!user;
  }
}
