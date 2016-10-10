import { assign } from 'lodash-es';


export default class ThesisInputController {
  static $inject = ['User'];

  constructor(User) {
    if (!User.details) { return; }
    const { thesis_title, thesis_grade } = User.details;
    assign(this, {
      User,
      title: thesis_title,
      grade: thesis_grade,
      styled: !thesis_title || !thesis_grade,
    });
  }

  blur() {
    this.styled = !this.title || !this.grade;
    const { old_title, old_grade } = this.User.details;
    if (old_title === this.title && old_grade === this.grade) { return; }
    const { title, grade } = this.User.updateThesis(this.title, this.grade);
    this.title = title;
    this.grade = grade;
  }

  focus() {
    this.styled = true;
  }
}
