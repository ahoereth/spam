import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';


export default {
  entry: 'src/index.js',
  dest: 'src/bundle.js',
  sourceMap: true,
  plugins: [
    babel({ exclude: 'node_modules/**' }),
    nodeResolve({ jsnext: true }),
    commonjs()
  ]
};
