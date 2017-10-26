import buble from 'rollup-plugin-buble'
const path = require('path')

export default {
  name: 'PageStack',
  entry: 'test/helpers/index.js',
  format: 'umd',
  dest: 'examples/index.js',
  sourceMap: true,
  plugins: [
    buble()
  ]
};
