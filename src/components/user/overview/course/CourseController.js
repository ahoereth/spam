import { pick } from 'lodash-es';

import formatGrade from '../../formatGrade';

export default class CourseController {
  static $inject = ['User'];

  constructor(User) {
    this.User = User;
  }

  $onInit() {
    this.course.term_abbr = this.course.term + this.course.year;
    this.oldGrade = formatGrade(this.course.grade);
    this.oldPassed = this.course.passed;
    this.grade(this.course.grade);
  }

  grade(newGrade) {
    this.course.grade = formatGrade(newGrade);
    this.course.passed =
      (this.course.grade >= 1 && this.course.grade <= 4) ||
      (this.course.passed && this.course.grade === this.oldGrade);
    this.course.failed = !this.course.passed && this.course.grade >= 5;
    this.field.courseChange(this.course);

    if (
      this.course.grade !== this.oldGrade ||
      this.course.passed !== this.oldPassed
    ) {
      this.course.muted = this.course.muted && !this.course.grade;
      this.oldGrade = this.course.grade;
      this.oldPassed = this.course.passed;
      this.course.customPUT({
        grade: this.course.grade,
        passed: this.course.passed,
        muted: this.course.muted,
      });
    }
  }

  mute() {
    this.field.courseChange(this.course);
    this.course.customPUT({ muted: this.course.muted });
  }

  remove() {
    this.course.muted = true;
    this.field.courseChange(this.course);
    this.User.removeCourse(this.course);
  }

  move(fieldId) {
    this.course.enrolled_field_id = fieldId;
    this.course.customPUT(pick(this.course, 'enrolled_field_id'));
    this.field.courseChange(this.course, true);
  }
}
