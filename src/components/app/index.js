import angular from 'angular';

import config from './config';
import constants from './constants';
import title from './title';
import services from './services';

import content from '../content';
import navbar from '../navbar';
import footer from '../footer';
import notfound from '../401';

import './layout.css';


/**
 * MODULE: spam.app
 */
export default angular
  .module('spam.app', [
    config, constants, title, services, navbar, content, footer, notfound,
  ])
  .name;
