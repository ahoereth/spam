/* eslint-disable import/no-extraneous-dependencies, import/extensions */
import {
  copySync as copy, readFileSync, writeFileSync as wfs, mkdirpSync as mkdirp,
} from 'fs-extra';
import { partialRight } from 'lodash';
import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
import replace from 'rollup-plugin-replace';
import html from 'rollup-plugin-html';
import uglify from 'rollup-plugin-uglify';
import eslint from 'rollup-plugin-eslint';
import less from 'rollup-plugin-less';
import LessNpmImport from 'less-plugin-npm-import';
import LessAutoprefix from 'less-plugin-autoprefix';
import LessCleanCss from 'less-plugin-clean-css';


const rfs = partialRight(readFileSync, { encoding: 'utf8' });
const ENV = process.env.NODE_ENV || 'development';
const remoteAPI = 'https://cogsci.uni-osnabrueck.de/~SPAM/api';
const APIURL = process.env.API === 'remote' ? remoteAPI : '/~SPAM/api';


const pattern = ENV !== 'production' ? /#DEV#\s*/g : /#PROD#\s*/g;
mkdirp('app');
wfs('app/.htaccess', rfs('src/.htaccess').replace(pattern, ''));
wfs('app/index.html', rfs('src/index.html').replace(/VER/g, Date.now()));
copy('src/robots.txt', 'app/robots.txt');
copy('node_modules/bootstrap/fonts', 'app/fonts/glyphicons');
copy('node_modules/open-sans-fontface/fonts', 'app/fonts/opensans');


export default {
  entry: 'src/index.js',
  dest: 'app/bundle.js',
  sourceMap: true,
  format: 'cjs',
  plugins: [
    eslint({ ignorePath: '.gitignore', include: 'src/**/*.js' }),
    less({
      output: 'app/bundle.css',
      include: ['**/*.css', '**/*.less'],
      exclude: 'nothing', // Wat?! `false`, `null` etc are being overwritten.
      // See https://github.com/xiaofuzi/rollup-plugin-less/pull/7
      insert: false,
      option: {
        plugins: [
          new LessNpmImport({}),
          new LessAutoprefix({ browsers: ['last 2 versions'] }),
          new LessCleanCss({
            advanced: true,
            keepSpecialComments: false,
            rebase: true,
          }),
        ],
      },
    }),
    html({
      include: '**/*.html',
      htmlMinifierOptions: {
        collapseBooleanAttributes: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true,
        removeEmptyAttributes: true,
        removeRedundantAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        removeComments: true,
      },
    }),
    babel({ exclude: ['node_modules/!(lodash-es)/**', 'src/**/*.css', 'src/**/*.less'] }),
    nodeResolve({ jsnext: true }),
    commonjs({ include: 'node_modules/**' }),
    replace({
      ENV: JSON.stringify(ENV),
      APIURL: JSON.stringify(APIURL),
    }),
    ENV !== 'production' ? () => {} : uglify({
      mangle: { toplevel: true, eval: true },
      compress: {
        unsafe: true,
        unsafe_comps: true,
        pure_getters: true,
        drop_console: true,
        angular: true,
      },
    }),
  ],
};
