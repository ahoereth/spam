export default class NotAuthorizedController {
  static $inject = ['$scope', '$routeParams', 'User'];

  constructor($scope, $routeParams, User) {
    this.userConstruct(undefined, User.details);
    this.lastroute = $routeParams.path;
    $scope.$on('user-construct', this.userConstruct);
  }

  userConstruct(event, user) {
    if (!user) {
      this.user = false;
    } else {
      this.user = {
        username: user.username,
        role: user.role,
        rank: user.rank
      };
    }
  }
}
