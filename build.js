import fs from 'fs'
import postcss from 'postcss'
import cssnano from 'cssnano'
import {minify} from 'terser'

const r = f => fs.readFileSync(f, 'utf8')
const min_js = async s => (await minify(s, {mangle: {toplevel: true}, toplevel: true, output: {comments: false}, compress: {global_defs: {'window.__DEBUG__': false}}})).code
const cssnano_conf = {preset: ['default', {normalizeUrl: false, discardComments: {removeAll: true}}]}
const min_css = async s => (await postcss([cssnano(cssnano_conf)]).process(s, {from: undefined})).css
const apply_repls = (s, repls) => repls.reduce((a, b) => a[b[2] ? 'replaceAll' : 'replace'](b[0], b[1]), s)

async function main() {
    const css = await min_css(r('dist/bundle.css'))
    const js = await min_js(apply_repls(r('dist/bundle.js'), [
        ['/icons.svg#', '#icon-', 1],
    ]))

    const pg = apply_repls(r('index.html'), [
        [/>\n+ */g, '>'],
        [/<!-- styles -->/, () => `<style>${css}</style>`],
        [/<script src[\s\S]*<\/script>/, () => `<script type=module>${js}</script>`],
    ])
    const icons = apply_repls(r('public/icons.svg'), [[/xmlns=".*?"/, ''], [/id="/g, 'id="icon-'], [/\n */g, ''], [/(\d")\//g, '$1 /'], [/="([^ ]+)"/g, '=$1']])
    fs.writeFileSync('dist/index.html', pg + icons)
}

main()
