import fs from 'fs';
import postcss from 'postcss';
import cssnano from 'cssnano';
import glob from 'glob';
import { minify } from 'terser';

const r = f => fs.readFileSync(f).toString();
const r_glob = (pattern, sep='') => glob.sync(pattern, {nosort: true}).map(f => r(f)).join(sep);
const min_js = async s => (await minify(s, {mangle: {toplevel: true}, toplevel: true})).code;
const min_css = async s => (await postcss([cssnano({preset: ['default', {normalizeUrl: false}]})]).process(s, {from: undefined})).css;
const apply_repls = (s, repls) => repls.reduce((a, b) => a.replace(b[0], b[1]), s);

async function main() {
    // Gather assets
    const css = await min_css(r_glob('public/assets/{main,bundle}.css'));
    const js = await min_js(r('public/assets/bundle.js'));

    // Combine
    const pg = apply_repls(r('public/index.html'), [
        [/>\n+ */g, '>'],
        [/<link rel=stylesheet[\s\S]+\.css>/, () => `<style>${css.replaceAll('/assets/', '')}</style>`],
        [/<script src[\s\S]*<\/script>/, () => `<script type=module>${js}</script>`],
    ]);
    const icons = apply_repls(r('public/assets/icons.svg'), [[/xmlns=".*?"/, 'hidden'], [/id="/g, 'id="icon-'], [/\n */g, ''], [/="([^ ]+)"/g, '=$1']]);
    fs.writeFileSync('dist/index.html', pg + icons);
}

main();
