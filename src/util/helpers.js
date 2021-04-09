function unique_lines(text) {
    return [...new Set(text.split('\n'))].sort().join('\n');
}
function sort_lines(text) {
    return text.split('\n').sort().join('\n');
}
function sort_lines_natural(text) {
    const sorter = (a, b) => a.localeCompare(b, navigator.languages[0] || navigator.language, {numeric: true, ignorePunctuation: true});
    return text.split('\n').sort(sorter).join('\n');
}
function reverse_lines(text) {
    return text.split('\n').reverse().join('\n');
}
function count_lines(text) {
    const map = text.split('\n').reduce((map, e) => map.set(e, (map.get(e) || 0) + 1), new Map());
    return map.entries().map(([k, v]) => `${k} --- ${v}`).join('\n');
}
