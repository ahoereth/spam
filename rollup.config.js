import { copySync as copy, readFileSync, writeFileSync as wfs } from 'fs-extra';
import { partialRight } from 'lodash';
import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
import replace from 'rollup-plugin-replace';
import less from 'rollup-plugin-less';
import html from 'rollup-plugin-html';
import lessNpmImport from 'less-plugin-npm-import';
import lessAutoprefix from 'less-plugin-autoprefix';
import lessCleanCss from 'less-plugin-clean-css';
import uglify from 'rollup-plugin-uglify';


const rfs = partialRight(readFileSync, { encoding: 'utf8' });
const ENV = process.env.NODE_ENV || 'development';
const dst = ENV !== 'production' ? 'dev' : 'app';


const pattern = ENV !== 'production' ? /#DEV#\s*/g : /#PROD#\s*/g;
const index = ENV !== 'production' ? 'index.html' : 'index-ship.html';
wfs(`${dst}/.htaccess`, rfs(`src/.htaccess`).replace(pattern, ''));
wfs(`${dst}/index.html`, rfs(`src/${index}`).replace(/VER/g, Date.now()));
copy(`src/robots.txt`, `${dst}/robots.txt`);
copy(`node_modules/bootstrap/fonts`, `${dst}/fonts/glyphicons`);
copy(`node_modules/open-sans-fontface/fonts`, `${dst}/fonts/opensans`);


export default {
  entry: 'src/index.js',
  dest: `${dst}/bundle.js`,
  sourceMap: true,
  format: 'cjs',
  plugins: [
    less({
      output: `${dst}/bundle.css`,
      // https://github.com/xiaofuzi/rollup-plugin-less/pull/3
      include: [ '**/*.less', '**/*.css' ],
      exclude: '',
      // https://github.com/xiaofuzi/rollup-plugin-less/pull/5
      insert: false,
      // https://github.com/xiaofuzi/rollup-plugin-less/pull/4
      option: {
        plugins: [
          new lessNpmImport({}),
          new lessAutoprefix({ browsers: ['last 2 versions'] }),
          new lessCleanCss({
            advanced: true,
            keepSpecialComments: false,
            rebase: true,
            target: dst,
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
    commonjs(),
    replace({
      ENV: JSON.stringify(ENV),
    }),
    ENV === 'production' ? uglify() : () => {},
  ]
};
