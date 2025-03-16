import commonjs from '@rollup/plugin-commonjs'
import globals from './rollup.globals'
import jscc from 'rollup-plugin-jscc'
import pkg from './package.svm.json'
import replace from '@rollup/plugin-replace'
import resolve from '@rollup/plugin-node-resolve'
import sucrase from '@rollup/plugin-sucrase'
import { nodeResolve } from '@rollup/plugin-node-resolve'

export default {
  input: 'src/index.js',
  output: [
    {
      format: 'es',
      globals: globals,
      file: 'dist/esm/index.svm.js'
    },
    {
      format: 'umd',
      name: pkg.moduleName,
      globals: globals,
      file: 'dist/umd/index.svm.js'
    },
  ],
  external: [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
  ],
  plugins: [
    jscc({ include: 'src/**', values: { _SOLANA: 1 }}),
    sucrase({
      exclude: ['node_modules/**'],
      transforms: ['jsx']
    }),
    resolve({
      extensions: ['.js',  '.jsx']
    }),
    nodeResolve(),
    commonjs({
      include: 'node_modules/**'
    }),
    replace({
      'process.env.NODE_ENV': JSON.stringify( 'production' ),
      preventAssignment: true
    })
  ]
}
