<textarea use:show_error_msg={textarea_error} on:input={e => input = e.target.value} readonly={export_type !== 'json'}>{text}</textarea>
<button class=fancy on:click={save} disabled={!enable_save}>Save</button>

<div class="radio-group flex-center">
  <label><input type=radio bind:group={export_type} value=json><div>json</div></label>
  <label><input type=radio bind:group={export_type} value=text><div>text</div></label>
</div>

<script>
import {state} from './store.js';
import {show_error_msg} from './ErrorMsg.svelte';

const new_repl = () => ({
    enabled: true,
    type: 'regex',
    search: '',
    replace: '',
    fn: '',
    flags: ['m', 'u', 'g'],
});

const to_text = d => d.map(r => [r.regex ? `/${r.search}/${r.flags.join('')}` : r.search, r.fn || r.replace].join('\t')).join('\n');
const to_json = d => JSON.stringify($state.repls, undefined, 2).replace(/(?<="flags": \[).*?(?=\])/gs, m => m.replace(/\s/g, ''));

let export_type = 'json';
let textarea_error = '';
let input = '';

$: text = export_type === 'json' ? to_json($state.repls) : to_text($state.repls);
onMount(() => {input = text;});

function parse_json(input) {
    if (export_type !== 'json')
        return;
    let json;
    try {
        json = JSON.parse(input);
    }
    catch (e) {
        textarea_error = e.message;
        return;
    }
    textarea_error = ''; // The element is destroyed if msg is empty, so don't destroy prematuraly
    return json;
}
$: parse_json(input)
$: enable_save = export_type === 'json' && input !== text && !textarea_error;

function save() {
    const json = parse_json(input);
    json.forEach((item, i) => {
        item = {...new_repl(), ...item, id: i + 1};
    });
    $state.repls = json;
    text = input;
}
</script>

<style>
textarea {
  display: block;
  width: 100%;
  height: clamp(700px, 60vh, 1000px);
  font-family: monospace;
  margin-bottom: 0.5rem;
}
button.fancy {
  display: block;
  margin-left: auto;
}
</style>
