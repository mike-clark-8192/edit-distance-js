import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';

const isProduction = process.env.NODE_ENV === 'production';

const config = {
    input: 'src/edit-distance.ts',
    output: [
        { file: 'dist/bundle.cjs.js', format: 'cjs' },
        { file: 'dist/bundle.umd.js', format: 'umd', name: 'edit_distance' },
        { file: 'dist/bundle.amd.js', format: 'amd', name: 'edit_distance' },
        { file: 'dist/bundle.iife.js', format: 'iife', name: 'edit_distance' },
        { file: 'dist/bundle.esm.js', format: 'es' }
    ],
    plugins: [
        nodeResolve(), // resolves node modules
        commonjs(), // converts commonjs to ES modules
        typescript(),
    ]
};

if (isProduction) {
    config.plugins.push(terser());
}

export default config;
