import buble from 'rollup-plugin-buble'

export default {
  name: 'PageStack',
  entry: 'src/index.js',
  format: 'umd',
  dest: 'index.js',
  sourceMap: true,
  plugins: [
    buble()
  ]
};
