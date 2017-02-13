export default class FooterController {
  static $inject = ['$scope'];

  constructor($scope) {
    this.$scope = $scope;
  }

  $onInit() {
    this.$scope.$on('user-construct', (e, u) => this.userConstruct(u));
    this.userConstruct();
  }

  userConstruct(user) {
    this.user = !!user;
  }
}
