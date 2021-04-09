import fs from 'fs';
import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import livereload from 'rollup-plugin-livereload';
import css from 'rollup-plugin-css-only';
import autoimport from 'svelte-preprocess-autoimport'
import { execFileSync as exec } from 'child_process';

const r = f => fs.readFileSync(f).toString();

const production = !process.env.ROLLUP_WATCH;
const preprocess = {
    markup({content}) {
        content = content.replace(/<icon id=(.+?)>/g, (_, id) => {
            const href = production ? '#icon-' : '/assets\/icons.svg#';
            return `<svg class="icon icon-${id}"><use xlink:href=${href}${id}/></svg>`;
        });
        return {code: content};
    },
};
const intro = `
window.__HELPERS__ = ${JSON.stringify(r('src/util/helpers.js'))};
window.__BUILD_DATE__ = '${(new Date).toISOString()}';
window.__BUILD_HASH__ = '${exec('git', ['rev-parse', '--short', 'HEAD']).toString().trim()}';
`;

export default {
    input: 'src/main.js',
    output: {
        sourcemap: true,
        format: 'iife',
        name: 'app',
        file: 'public/assets/bundle.js',
        strict: false,
        intro,
    },
    plugins: [
        svelte({
            compilerOptions: {
                dev: !production,
            },
            preprocess: [preprocess, autoimport()],
            onwarn(warning, handler) {
                if (['a11y-autofocus', 'a11y-no-onchange'].includes(warning.code))
                    return;
                handler(warning);
            },
        }),
        css({output: 'bundle.css'}),

        resolve({
            browser: true,
            dedupe: importee => importee === 'svelte' || importee.startsWith('svelte/'),
        }),
        commonjs(),

        !production && livereload({watch: ['public/assets/bundle.js', 'public/assets/main.css']}),
    ],
    watch: {
        clearScreen: false,
    },
};
