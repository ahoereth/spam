import formatGrade from '../../formatGrade';


export default class gradeInputController {
  static $inject = ['$scope'];

  constructor($scope) {
    $scope.$watch('$ctrl.grade', this.changeGrade);
    this.grade = formatGrade(this.grade);
  }

  changeGrade(newGrade, oldGrade) {
    if (
      newGrade === oldGrade ||
      parseFloat(newGrade) === parseFloat(oldGrade)
    ) {
      return false;
    }

    this.grade = formatGrade(newGrade);
    if (
      (this.editable && (newGrade || (!newGrade && oldGrade))) || // Special case for fields.
      (!this.editable && !newGrade && oldGrade) // Special case for courses.
    ) {
      this.change({newGrade: this.grade});
    }
  };
}
