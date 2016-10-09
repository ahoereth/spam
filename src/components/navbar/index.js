import angular from 'angular';

import highlight from '../lib/highlight';
import iif from '../lib/iif';
import year from '../lib/year';
import landing from '../landing';
import courses from '../courses';
import guide from '../guide';
import user from '../user';
import admin from '../admin';
import NavbarController from './NavbarController';

import './navbar.less';
import './loader.less';


const navbarComponent = {
  templateUrl: 'components/navbar/navbar.html',
  controller: 'NavbarController',
  controllerAs: 'navbar',
};


/**
 * MODULE: spam.navbar
 * COMPONENT: navbar
 * CONTROLLER: NavbarController
 */
export default angular
  .module('spam.navbar', [
    highlight, iif, year, landing, courses, guide, user, admin,
  ])
  .component('navbar', navbarComponent)
  .controller('NavbarController', NavbarController)
  .name;
