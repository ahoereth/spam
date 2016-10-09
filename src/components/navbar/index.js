import angular from 'angular';

import highlight from '../lib/highlight';
import iif from '../lib/iif';
import year from '../lib/year';
import landing from '../landing';
import courses from '../courses';
import guide from '../guide';
import user from '../user';
import admin from '../admin';

import controller from './NavbarController';
import template from './navbar.html';
import './navbar.less';
import './loader.less';


/**
 * MODULE: spam.navbar
 * COMPONENT: navbar
 */
export default angular
  .module('spam.navbar', [
    highlight, iif, year, landing, courses, guide, user, admin,
  ])
  .component('navbar', {
    template,
    controller,
    controllerAs: 'navbar',
  })
  .name;
