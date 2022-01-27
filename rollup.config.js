import * as path from 'path'
import typescript from 'rollup-plugin-typescript2'
import resolve from '@rollup/plugin-node-resolve'
import { terser } from 'rollup-plugin-terser'
import replace from '@rollup/plugin-replace'
import dts from 'rollup-plugin-dts'
import { version } from './package.json'

const builds = {
  'cjs-dev': {
    outFile: 'vue-composition-api.common.js',
    format: 'cjs',
    mode: 'development',
  },
  'cjs-prod': {
    outFile: 'vue-composition-api.common.prod.js',
    format: 'cjs',
    mode: 'production',
  },
  'umd-dev': {
    outFile: 'vue-composition-api.js',
    format: 'umd',
    mode: 'development',
  },
  'umd-prod': {
    outFile: 'vue-composition-api.prod.js',
    format: 'umd',
    mode: 'production',
  },
  esm: {
    outFile: 'vue-composition-api.esm.js',
    format: 'es',
    mode: 'development',
  },
  mjs: {
    outFile: 'vue-composition-api.mjs',
    format: 'es',
    mode: 'development',
  },
}

function onwarn(msg, warn) {
  if (!/Circular/.test(msg)) {
    warn(msg)
  }
}

function getAllBuilds() {
  return Object.keys(builds).map((key) => genConfig(builds[key]))
}

function genConfig({ outFile, format, mode }) {
  const isProd = mode === 'production'
  return {
    input: './src/index.ts',
    output: {
      file: path.join('./dist', outFile),
      format: format,
      globals: {
        vue: 'Vue',
      },
      exports: 'named',
      name: format === 'umd' ? 'VueCompositionAPI' : undefined,
    },
    external: ['vue'],
    onwarn,
    plugins: [
      typescript({
        tsconfigOverride: {
          declaration: false,
          declarationDir: null,
          emitDeclarationOnly: false,
        },
        useTsconfigDeclarationDir: true,
      }),
      resolve(),
      replace({
        preventAssignment: true,
        'process.env.NODE_ENV':
          format === 'es'
            ? // preserve to be handled by bundlers
              'process.env.NODE_ENV'
            : // hard coded dev/prod builds
              JSON.stringify(isProd ? 'production' : 'development'),
        __DEV__:
          format === 'es'
            ? // preserve to be handled by bundlers
              `(process.env.NODE_ENV !== 'production')`
            : // hard coded dev/prod builds
              !isProd,
        __VERSION__: JSON.stringify(version),
      }),
      isProd && terser(),
    ].filter(Boolean),
  }
}

let buildConfig

if (process.env.TARGET) {
  buildConfig = [genConfig(builds[process.env.TARGET])]
} else {
  buildConfig = getAllBuilds()
}

// bundle typings
buildConfig.push({
  input: 'src/index.ts',
  output: {
    file: 'dist/vue-composition-api.d.ts',
    format: 'es',
  },
  onwarn,
  plugins: [dts()],
})

export default buildConfig
