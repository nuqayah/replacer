export const unescape = s => s.replace(/(?<!\\)\\(n|t|u[0-9a-f]{4})/g, m => JSON.parse(`"${m}"`));
export const ar_nums = s => ('' + s).replace(/[0-9]/g, d => '٠١٢٣٤٥٦٧٨٩'.substr(+d, 1));
export function debounce(fn, timeout) {
    let timeout_id;
    return (...args) => {
        clearTimeout(timeout_id);
        timeout_id = setTimeout(() => fn(...args), timeout);
    };
}
export function html_entities(s) {
    const repls = {'&': '&amp;', '<': '&lt;', '>': '&gt;'};
    return s.replace(RegExp(`[${Object.keys(repls).join('')}]`, 'g'), m => repls[m]);
}
