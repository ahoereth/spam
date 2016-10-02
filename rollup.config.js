import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';


export default {
  entry: 'src/index.js',
  dest: 'src/bundle.js',
  sourceMap: false,
  plugins: [
    nodeResolve({ jsnext: true }),
    commonjs()
  ]
};
