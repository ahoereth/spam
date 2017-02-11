import formatGrade from '../../formatGrade';


export default class GradeInputController {
  static $inject = ['$scope'];

  constructor($scope) {
    $scope.$watch('$ctrl.grade', (n, o) => this.changeGrade(n, o));
  }

  $onInit() {
    this.grade = formatGrade(this.grade);
  }

  changeGrade(newGrade, oldGrade) {
    if (
      newGrade === oldGrade ||
      parseFloat(newGrade) === parseFloat(oldGrade)
    ) {
      return;
    }

    this.grade = formatGrade(newGrade);
    if (this.active && (newGrade || (!newGrade && oldGrade))) {
      this.change({ newGrade: this.grade });
    }
  }
}
