import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
import replace from 'rollup-plugin-replace';
import less from 'rollup-plugin-less';

import lessNpmImport from 'less-plugin-npm-import';


export default {
  entry: 'src/index.js',
  dest: 'src/bundle.js',
  sourceMap: true,
  plugins: [
    less({
      output: 'src/bundle.css',
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
      ENV: JSON.stringify(process.env.NODE_ENV || 'development'),
    }),
  ]
};
