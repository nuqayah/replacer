import {defineConfig} from 'vite'
import {svelte} from '@sveltejs/vite-plugin-svelte'
import svelte_preprocess from 'svelte-preprocess'
import path from 'path'
import {execFileSync as exec} from 'child_process'
import fs from 'fs'
import AutoImport from 'unplugin-auto-import/vite'

const r = f => fs.readFileSync(f, 'utf8')

function markup_repls({content}) {
    content = content.replace(/<icon id=(.+?)>/g, (_, id) => {
        return `<svg class="icon icon-${id}"><use href=/icons.svg#${id}></svg>`
    })
    content = content.replace(/(?<=<a )(?=href="?https?:)/g, 'target=_blank ')
    return {code: content}
}

const is_build = process.argv.includes('build')
const vars = {
    'window.__TEXT_FNS__': `${JSON.stringify(r('src/util/text_fns.js'))}`,
    'window.__BUILD_DATE__': `'${(new Date).toISOString()}'`,
    'window.__BUILD_HASH__': `'${exec('git', ['rev-parse', '--short', 'HEAD']).toString().trim()}'`,
}
const build_config = {
    lib: {
        entry: 'src/main.js',
        formats: ['es'],
        fileName: (format) => `bundle.${format}.js`,
    },
    rollupOptions: {
        output: {
            entryFileNames: 'bundle.js',
            assetFileNames: 'bundle.css',
            intro: Object.entries(vars).map(([k, v]) => `${k} = ${v}`).join('\n'),
        },
    },
}
export default defineConfig({
    publicDir: is_build ? false : 'public',
    build: {
        reportCompressedSize: false,
        minify: false,
        ...(is_build ? build_config : {}),
    },
    server: {host: !!process.env.VITE_HOST},
    resolve: {
        alias: [{find: '~', replacement: path.resolve('src')}],
    },
    define: is_build ? {} : vars,
    plugins: [
        svelte({
            preprocess: [
                {markup: markup_repls},
                svelte_preprocess({markupTagName: 'not_a_tag'}),
            ],
            onwarn(warning, handler) {
                if (['a11y-autofocus', 'security-anchor-rel-noreferrer'].includes(warning.code))
                    return
                handler(warning)
            },
        }),
        AutoImport({
            imports: [
                'svelte',
                'svelte/store',
                'svelte/transition',
                'svelte/animate',
            ],
            dts: './src/auto-imports.d.ts',
        }),
    ],
    optimizeDeps: {
        exclude: ['tinro'],
    },
})
