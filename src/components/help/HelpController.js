export default class HelpController {
  static $inject = ['$scope', '$location', '$routeParams'];

  constructor($scope, $location, $routeParams) {
    $scope.opened = $routeParams.subject || '';
    $scope.open = subject => {
      subject = ($scope.opened !== subject) ? subject : '';
      $location.path(`/help/${subject}`);
    };
  }
}
