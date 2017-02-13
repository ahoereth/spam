/* global process */
export const API = process.env.APIURL || '/~SPAM/api';
export const O2URL = 'https://cogsci.uni-osnabrueck.de/~SPAM/api/o2.php';
export const TITLE = 'Studyplanning in Cognitive Science';
export const DEBUG = process.env.NODE_ENV !== 'production';
export const HTML5MODE = true;
export const HASHPREFIX = '!';
