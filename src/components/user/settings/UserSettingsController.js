export default class UserSettingsController {
  static $inject = ['$scope', 'Restangular', 'User'];

  constructor($scope, Restangular, User) {
    this.user = User.details;
    this.regulation = User.details.regulations[this.user.regulation_id];
    this.UserService = User;

    $scope.$watchGroup(
      [() => this.user.firstname, () => this.user.lastname],
      ([firstname, lastname], [f2, l2]) => {
        if (firstname !== f2 || lastname !== l2) {
          User.updateUser({ firstname, lastname });
        }
      },
    );

    $scope.$watch(
      () => this.regulation,
      (regulation, oldRegulation) => {
        if (regulation !== oldRegulation) {
          User.updateUser({ regulation_id: regulation.regulation_id });
        }
      },
    );
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
  };
}
