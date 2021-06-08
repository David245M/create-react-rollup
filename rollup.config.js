import serve from "rollup-plugin-serve"
import livereload from "rollup-plugin-livereload"
import babel from '@rollup/plugin-babel'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import replace from '@rollup/plugin-replace'
import { terser } from 'rollup-plugin-terser'
import { defineConfig } from "rollup"
import postcss from 'rollup-plugin-postcss'
import progress from 'rollup-plugin-progress'
import path from 'path'

const { ROLLUP_WATCH } = process.env
const srcDir = 'src'
const buildDir = "build"
const devDir = "public"

const isProduction = !ROLLUP_WATCH
const dir = isProduction ? buildDir : devDir

export default defineConfig({
  input: `${srcDir}/index.js`,
  output: {
    dir,
    format: isProduction ? 'es' : 'iife',
    sourcemap: !isProduction,
  },
  plugins: [
    progress(),
    nodeResolve({
      browser: true,
      extensions: ['.js', '.jsx', '.json'],
    }),
    // replacing strings in bundle
    replace({
      preventAssignment: true,
      exclude: 'node_modules/**',
      'process.env.NODE_ENV': JSON.stringify(isProduction ? 'production' : 'development'),
    }),
    babel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**',
      presets: ['@babel/preset-react'],
    }),
    commonjs(),
    // enables styles modules and creates css bundle
    postcss({
      autoModules: true,
      minimize: isProduction,
      extensions: ['.css', '.scss'],
      extract: path.resolve(`${dir}/style.css`),
    }),
    // starts the development server
    !isProduction && serve({
      verbose: true,
      contentBase: ['', "public"],
      host: 'localhost',
      port: 3000,
    }),
    !isProduction && livereload({ watch: devDir }),

    // code minification
    (isProduction && terser()),  
  ]
})