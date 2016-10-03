export default class FooterController {
  static $inject = ['$scope'];

  constructor($scope) {
    $scope.$on('user-construct', this.userConstruct);
    this.userConstruct();
  }

  userConstruct(event, user) {
    this.user = !!user;
  }
}
