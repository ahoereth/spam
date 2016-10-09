import {
  createReadStream as crs, createWriteStream as cws,
  readFileSync, writeFileSync as wfs,
} from 'fs';

import { partialRight } from 'lodash';

import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
import replace from 'rollup-plugin-replace';
import less from 'rollup-plugin-less';

import lessNpmImport from 'less-plugin-npm-import';


const rfs = partialRight(readFileSync, { encoding: 'utf8' });
const ENV = process.env.NODE_ENV || 'development';
const dst = ENV !== 'production' ? 'dev' : 'app';


const htmlext = ENV !== 'production' ? '' : '-ship';
crs(`src/index${htmlext}.html`).pipe(cws(`${dst}/index.html`));
crs(`src/robots.txt`).pipe(cws(`${dst}/robots.txt`));
crs(`src/.htaccess.txt`).pipe(cws(`${dst}/.htaccess`));


export default {
  entry: 'src/index.js',
  dest: `${dst}/bundle.js`,
  sourceMap: true,
  plugins: [
    less({
      output: `${dst}/bundle.css`,
      // https://github.com/xiaofuzi/rollup-plugin-less/pull/3
      include: [ '**/*.less', '**/*.css' ],
      // https://github.com/xiaofuzi/rollup-plugin-less/pull/5
      insert: false,
      // https://github.com/xiaofuzi/rollup-plugin-less/pull/4
      option: { plugins: [ new lessNpmImport({}) ] },
    }),
    babel({ exclude: ['node_modules/**', 'src/**/*.css', 'src/**/*.less'] }),
    nodeResolve({ jsnext: true }),
    commonjs(),
    replace({
      ENV: JSON.stringify(ENV),
    }),
  ]
};
