import { assign } from 'lodash-es';

export default class ThesisInputController {
  static $inject = ['User'];

  constructor(User) {
    if (!User.details) {
      return;
    }
    this.User = User;
  }

  $onInit() {
    const { thesis_title, thesis_grade } = this.User.details;
    assign(this, {
      title: thesis_title,
      grade: thesis_grade,
      styled: !thesis_title || !thesis_grade,
    });
  }

  blur() {
    this.styled = !this.title || !this.grade;
    const thesis = this.User.updateThesis(this.title, this.grade);
    this.title = thesis.thesis_title;
    this.grade = thesis.thesis_grade;
  }

  focus() {
    this.styled = true;
  }
}
