import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import { createBundle as dtsBuddyCreateBundle } from 'dts-buddy';
import { createRequire } from "module";
const require_ = createRequire(import.meta.url);
const packageJson = require_("./package.json");

const isProduction = process.env.NODE_ENV === 'production';

function buildConfig() {

    const config = {
        input: 'src/edit-distance.ts',
        output: [
            { file: packageJson.main, format: 'cjs' },
            { file: packageJson.module, format: 'es' },
            { file: packageJson.unpkg, format: 'umd', name: 'edit_distance' },
            { file: packageJson.browser, format: 'iife', name: 'edit_distance' },
            { file: packageJson.types, format: 'es' }
        ],
        plugins: [
            nodeResolve(),
            commonjs(),
            typescript(),
            isProduction && terser(),
            dts(),
        ]
    };

    function dts() {
        return {
            name: 'dts',
            closeBundle() {
                console.log('Generating dts bundle...');
                dtsBuddyCreateBundle({
                    project: 'tsconfig.json',
                    output: packageJson.types,
                    modules: {
                        'edit-distance': 'src/edit-distance.ts',
                    },
                });
            }
        };
    }

    return config;
}



export default buildConfig();