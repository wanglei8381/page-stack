import buble from 'rollup-plugin-buble'

export default {
  entry: 'src/index.js',
  format: 'cjs',
  dest: 'index.js',
  sourceMap: true,
  plugins: [
    buble()
  ]
};
