export default class UserSettingsController {
  static $inject = ['$scope', 'Restangular', 'User'];

  constructor($scope, Restangular, User) {
    this.user = User.details;
    this.UserService = User;
    $scope.$watchGroup(['user.firstname', 'user.lastname'], (n, o) => {
      if (n === o) { return; }
      const [firstname, lastname] = n;
      User.updateUser({ firstname, lastname }, true);
    });
  }

  deleteUser() {
    this.UserService.deleteUser();
  }

  export = {
    loading: false,
    data: false,
    init: () => {
      this.export.loading = true;
      this.user.get().then(data => {
        this.export.data = JSON.stringify(data.plain(), null, '  ');
        this.export.loading = false;
      });
    },
  }
}
