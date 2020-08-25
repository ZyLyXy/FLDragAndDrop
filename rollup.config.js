

import compiler from '@ampproject/rollup-plugin-closure-compiler'
import alias from '@rollup/plugin-alias'
import * as clipboardy from 'clipboardy'
import cssnano from 'cssnano'
import * as fs from 'fs'
import babel from 'rollup-plugin-babel'
import commonjs from 'rollup-plugin-commonjs'
import livereload from 'rollup-plugin-livereload'
import resolve from 'rollup-plugin-node-resolve'
import postcss from 'rollup-plugin-postcss'
import replace from 'rollup-plugin-replace'
import serve from 'rollup-plugin-serve'

const extensions = ['.js', '.jsx', '.ts', '.tsx']
const isProduction = process.env.NODE_ENV === 'production'
const isWatch = process.env.WATCH === '1'
const isClip = process.env.CLIP === '1'
const outBundleName = isProduction ? 'dist/bundle.min.js' : 'dist/bundle.js'

// https://rollupjs.org/guide/en
export default {
	input: 'src/index.tsx',
	output: {
		file: outBundleName,
		format: 'iife'
	},
	plugins: [
		postcss({
			inject: false,
			plugins: [isProduction && cssnano({ preset: 'default' })]
		}),

		// https://github.com/rollup/rollup-plugin-replace#usage
		replace({
			'process.env.NODE_ENV': JSON.stringify(isProduction ? 'production' : 'development')
		}),

		// https://github.com/infernojs/inferno#rollup
		// https://github.com/rollup/rollup-plugin-alias#usage
		!isProduction && alias({
			entries: [{ find: 'inferno', replacement: 'node_modules/inferno/dist/index.dev.esm.js' }]
		}),

		// https://github.com/rollup/rollup-plugin-babel#usage
		// https://babeljs.io/docs/en/options
		babel({
			extensions, // If we don’t set this, Babel will ignore our TypeScript files. See `npx babel --help`
			presets: [
				// https://babeljs.io/docs/en/babel-preset-env#options
				isProduction ? ["@babel/preset-env", {
					targets: {
						// ie: "11"
						chrome: "70"
					},
					// useBuiltIns: 'usage' // Turn off for now, but may want to for core-js stuff.
				}] : {}
			],
			include: isProduction ? '**' : 'src/**',
			// Prevent `useBuiltIns` from causing a loop:
			exclude: 'node_modules/core-js/**'
		}),

		// https://github.com/rollup/rollup-plugin-node-resolve#usage
		resolve({
			extensions,
			browser: true
		}),

		// https://github.com/rollup/rollup-plugin-commonjs#usage
		isProduction && commonjs({
			// https://github.com/zloirock/core-js uses CommonJS
			include: 'node_modules/core-js/**'
		}),

		// https://github.com/google/closure-compiler/wiki/Flags-and-Options
		isProduction && compiler({
			compilation_level: 'SIMPLE',
			language_in: 'ECMASCRIPT_2018',
			language_out: 'ECMASCRIPT_2018' // was SIMPLE & ECMASCRIPT_2017 & ECMASCRIPT5
		}),

		isClip && {
			name: 'copy-to-clipboard',
			writeBundle() {
				const data = fs.readFileSync(outBundleName, { encoding: 'utf8' });
				// TODO: Banner Version?
				const banner = `// ==UserScript==
// @name         F-L Drag&Drop 1.0
// @namespace    http://tampermonkey.net/
// @version      1.0.3
// @description
// @author       ZyLyXy
// @match        https://www.f-list.net/character_edit.php*
// @grant        none
// @run-at       document-idle
// ==/UserScript==
`;
				clipboardy.write(banner + data);
			},
		},

		isWatch && serve({
			open: false,
			contentBase: 'dist'
		}),

		isWatch && livereload({
			watch: 'dist'
		})
	]
};
