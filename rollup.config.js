import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
import uglify from 'rollup-plugin-uglify';
import replace from 'rollup-plugin-replace';

var env = process.env.NODE_ENV;
var config = {
  format: 'umd',
  moduleName: 'ReactRequest',
  external: ['react'],
  globals: {
    react: 'React'
  },
  context: 'this',
  plugins: [
    nodeResolve({
      jsnext: true
    }),
    commonjs({
      include: 'node_modules/**'

      // explicitly specify unresolvable named exports
      // (see below for more details)
      // namedExports: { './module.js': ['foo', 'bar' ] },  // Default: undefined
    }),
    babel({
      exclude: 'node_modules/**'
    }),
    replace({
      'process.env.NODE_ENV': JSON.stringify(env)
    })
  ]
};

if (env === 'production') {
  config.plugins.push(
    uglify({
      compress: {
        pure_getters: true,
        unsafe: true,
        unsafe_comps: true,
        warnings: false
      }
    })
  );
}

export default config;
