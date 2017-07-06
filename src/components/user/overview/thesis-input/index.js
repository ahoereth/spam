import angular from 'angular';

import blurOnEnter from '../../../lib/blur-on-enter';
import userService from '../../services/user';

import controller from './ThesisInputController';
import template from './thesis-input.html';

/**
 * MODULE: spam.user.overview.thesis-input
 * COMPONENT: thesisInput
 */
export default angular
  .module('spam.user.overview.thesis-input', [blurOnEnter, userService])
  .component('thesisInput', { template, controller }).name;
