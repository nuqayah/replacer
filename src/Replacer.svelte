<div class="wrapper flex-column">
<header><h3>Replacer</h3></header>

<ol class=repl-list>
{#each $state.repls as repl, i (repl.id)}
<li class:disabled={!repl.enabled} use:show_tip={repl_errors[i]} transition:slide|local animate:flip={{duration: 400}}>
  <div class="flex">
    <!-- Search -->
    <div class=input-wrapper>
      <div class=flex>
        <input bind:value={repl.search} type=text placeholder="search pattern">
        <Popover>
          <button class="text-sm px-1" slot=button let:toggle on:click={toggle} title="RegExp flags" hidden={repl.type === 'plain'} on:mousedown={e => e.stopPropagation()}><icon id=chevron-bottom> {@html prep_flags(repl.flags)}</button>
          <ul class="popover popover-menu-checkboxes">
            {#each regex_flags as flag}
              <li>
                <button
                  on:click={() => {toggle_flag(repl, flag[0]); repl = repl}}
                  class:selected={repl.flags.includes(flag[0])}
                >
                  <div class="float-right ps-2"><input type=checkbox checked={repl.flags.includes(flag[0])}></div>
                  <span><strong>{flag[0]}</strong> — {@html flag[1]}</span>
                </button>
              </li>
            {/each}
          </ul>
        </Popover>
      </div>
      {#if /\p{sc=Arabic}|\p{scx=Arabic}/u.test(repl.search)}
        <div class=split contenteditable on:cut={e => {e.preventDefault()}} on:paste={e => {e.preventDefault()}} on:keydown={allow_special}>{@html split_regex(repl.search)}</div>
      {/if}
    </div>

    <!-- Replace -->
    <div class="input-wrapper flex">
      {#if repl.fn && repl.type === 'regex'}
        <input type=text readonly value="ƒ(): {repl.fn}" class=fn>
      {:else}
        <input bind:value={repl.replace} type=text placeholder="replace pattern">
      {/if}
      <Popover>
        <button class="text-sm px-1" slot=button let:toggle on:click={toggle} on:mousedown={e => e.stopPropagation()}><icon id=chevron-bottom> ƒ()</button>
        <ul class="popover popover-menu-checkboxes">
        <li>
          <button on:click={() => {repl.fn = null; repl = repl}}>
            <b>clear</b>
          </button>
        </li>
        {#each Object.keys(replace_functions) as fn}
          <li>
            <button on:click={() => {repl.fn = fn; repl = repl}} class:selected={repl.fn === fn}>
              <div class="float-right ps-2"><input type=checkbox checked={repl.fn === fn}></div>
              <code>{fn}</code>
            </button>
          </li>
        {/each}
        </ul>
      </Popover>
    </div>

    <!-- Options -->
  <div class="flex align-center">
    <Toggle bind:value={repl.enabled}/>&nbsp;
    <Popover>
      <button class=btn slot=button let:toggle on:click={toggle} title=Actions on:mousedown={e => e.stopPropagation()}><icon id=chevron-bottom></button>
      <ul class=popover>
        <div class="flex action-wrap">
          <div class="flex radio-group">
            <label><input type=radio bind:group={repl.type} value=regex><div><code>.*</code></div></label>
            <label><input type=radio bind:group={repl.type} value=plain><div><code>a=a</code></div></label>
          </div>&nbsp;
            <button class=btn on:click={() => remove_repl(i)}>✕</button>
            &nbsp;
          {#if i > 0}
            <button class=btn on:click={() => move_repl(i, -1)}><icon id=arrow-up></button>
          {/if}
          {#if (i + 1) < $state.repls.length}
            <button class=btn on:click={() => move_repl(i, 1)}><icon id=arrow-down></button>
          {/if}
        </div>
      </ul>
    </Popover>&nbsp;
    <div class=bordered>
      <span class="mark repl-{i + 1}" style="padding: 0 1rem; margin: 0 0.2rem;">&nbsp;</span>
      <span class=match-count>{matches[i]?.count || '0'}</span>
    </div>
  </div>
</div>
</li>
{/each}
</ol>

<div>
  <div class="inline-block my-2 px-1"><Toggle text="Live evaluation" bind:value={live_eval}/></div>
  <button class=btn on:click={() => { $state.repls = [...$state.repls, new_repl()]; }}>+ Add input</button>
  <button class=btn on:click={() => modal_show(ImportExport)}><icon id=import-export> Import / Export</button>
  <button class=btn on:click={() => { input = apply_repls(input, get_repls()); }}>Move Output to Input</button>
</div>

<button on:click={() => { editor_shown = !editor_shown; }} class="flex flex-end more-btn" class:expanded={editor_shown}>
  <h3>Replacement functions</h3> <icon id=chevron-bottom>
</button>
<div use:show_tip={script_error_msg}>
  <CodeMirror bind:this={editor} on:change={debounce(update_functions, 1000)} max_height={editor_shown ? 500 : 0}/>
</div>

<div class="flex flex-1 overflow-auto flex-wrap" style="min-height: 500px">
  <div class="flex-column flex-1 flex-basis-500">
    <h3>Input</h3>
    <div class="textarea flex-1 input" dir=auto contenteditable=plaintext-only bind:this={input_el}
      on:blur={e => {input = e.target.innerText;}}
      on:paste={e => {let data = e.clipboardData.getData('text/plain'); setTimeout(() => {input = data}, 100);}}></div>
  </div>

  <div class="flex-column flex-1 flex-basis-500">
    <div class=flex><h3>Output</h3> <Toggle text=Diff bind:value={show_diff}/></div>
    {#if show_diff}
      <Diff a={input} b={output}/>
    {:else}
      <textarea class="flex-1 output" dir=auto bind:this={output_el}>{output}</textarea>
    {/if}
  </div>
</div>
</div>

<script>
import CodeMirror from './CodeMirror.svelte';
import Toggle from 'components/src/Toggle.svelte'
import Popover from 'components/src/Popover.svelte'
import ImportExport from './ImportExport.svelte';
import Diff from './Diff.svelte';
import {state} from './store.js';
import {debounce, unescape, html_entities} from './util/util.js';
import {show as modal_show} from 'components/src/Modal.svelte'
import {options as tip_options} from 'components/src/Tooltip.svelte'

function show_tip(el, err) {
    function update(err) {
        tip_options.set(err ? {show: true, msg: err, attach_to: el} : {show: false})
    }
    return {update}
}

const regex_flags = [
    ['s', 'Allows <code>.</code> to match newline characters.'],
    ['i', 'Case-insensitive search.'],
    ['m', 'Changes <code>^</code> and <code>$</code> operate on each line, instead of the whole string'],
    ['u', 'Unicode property search using <code>\\p</code> (and <code>\\P</code>, for negation).'],
    ['g', 'Global search (finds all matches — not only the first).'],
    ['h', 'Ḥarakāt-insensitive search: adds <span class=noname>[<span>ً</span>-<span>ْ</span>]*</span> after Arabic letters (not an actualy <code>RegExp</code> flag; may cause breakage).'],
];

const apply_repls = (s, repls) => repls.reduce((str, repl) => str[repl[0] instanceof RegExp ? 'replace' : 'replaceAll'](repl[0], repl[1]), s);
const harakat_prep = s => RegExp(s.replace(/[ء-يّ]/g, '$&[ً-ْ]*'), 'g');
function allow_special(e) {
    const is_special = e.keyCode < 47 || (e.keyCode > 90 && e.keyCode < 94) || e.metaKey; // Last is shortcut
    if (!is_special)
        e.preventDefault();
}
const insert_str_at = (str, i, sub, ln) => str.slice(0, i) + sub + str.slice(i + ln);
const get_max_id = () => $state.repls.map(repl => repl.id).sort((a, b) => a - b).findIndex((id, i) => id !== i + 1);
const new_repl = id => ({
    enabled: true,
    id: id || ((get_max_id() > -1 ? get_max_id() : $state.repls.length) + 1),
    type: 'regex',
    search: '',
    replace: '',
    fn: '',
    flags: ['m', 'u', 'g'],
});

let repl_errors = [];
let editor;
let matches = [];
if (!$state.repls.length)
    $state.repls = [new_repl(1), new_repl(2)];

let input = '';
let output = ''
let input_el;
let output_el;
let live_eval = true;
let show_diff

let editor_shown = false;
let script_error_msg = '';
let replace_functions = {};

const prep_flags = flags => regex_flags.map(([f]) => flags.includes(f) ? `<b>${f}</b>` : `<span class=faded>${f}</span>`).join('');
function toggle_flag(repl, flag) {
    // Flags isn't a set to keep parsing and serializing simple
    const index = repl.flags.indexOf(flag);
    if (index === -1)
        repl.flags.push(flag);
    else
        repl.flags.splice(index, 1);
}

function prep_repl(repl) {
    if (repl.type === 'regex') {
        try {
            const replace = repl.fn && repl.fn in replace_functions ? replace_functions[repl.fn] : unescape(repl.replace);
            let harakat = repl.flags.includes('h');
            let {flags, search} = repl;
            if (harakat) {
                flags = flags.filter(flag => flag !== 'h');
                search = harakat_prep(repl.search);
            }
            return [RegExp(search, flags.join('')), replace];
        }
        catch (error) {
            repl_errors[$state.repls.indexOf(repl)] = `${error.message}`;
            return ['', repl.replace];
        }
    }
    else if (repl.type === 'plain')
        return [unescape(repl.search), unescape(repl.replace)];
}

const split_regex = s => s.replace(/./g, m => `<span class=${/\p{gc=Mn}/u.test(m) ? 'harakah' : ''}>${m}</span>`);
const get_repls = () => $state.repls.filter(r => r.enabled && r.search).map(prep_repl);

$: if (live_eval && input_el && output_el) {
    repl_errors = [];
    matches = [];

    let input_copy = input;
    $state.repls.forEach((repl, i) => {
        if (!repl.enabled || !repl.search)
            return;
        repl = prep_repl(repl);
        matches[i] = {count: 0, items: []};
        input_copy = input_copy[repl[0] instanceof RegExp ? 'replace' : 'replaceAll'](repl[0], (...args) => {
            if (!args[0].includes('\0')) { // Don't highlight matches that overlap (workaround)
                matches[i].count++;
                matches[i].items.push([args[0], args.slice(-2)[0]]);
            }
            return '\0'.repeat(args[0].length);
        });
    });
    matches.flatMap(m => m.items).sort((a, b) => b[1] - a[1]).forEach(m => {
        // Use \0,\1 to bypass html_entities
        const repl_with = `\u0001mark class=repl-${1}\u0002${m[0]}\u0001/mark\u0002`;
        input_copy = insert_str_at(input_copy, m[1], repl_with, m[0].length);
    });
    input_el.innerHTML = apply_repls(html_entities(input_copy), [[/\u0001/g, '<'], [/\u0002/g, '>']]);
    matches = matches;

    output = apply_repls(input, get_repls())
}

function move_repl(i, direction) {
    const repl = $state.repls[i];
    $state.repls.splice(i, 1);
    $state.repls.splice(i + direction, 0, repl);
    $state.repls = $state.repls;
}
function remove_repl(i) {
    if (!confirm('Remove?'))
        return;
    $state.repls.splice(i, 1);
    $state.repls = $state.repls;
}

function get_methods(script_text) {
    const create_el = (tag, attrs) => Object.assign(document.createElement(tag), attrs);
    const iframe = document.body.appendChild(create_el('iframe', {style: 'display: none'}));

    const win = iframe.contentWindow;
    const win_keys = new Set(Object.keys(win));

    // innerText doesn't preserve \n
    const script_el = create_el('script', {innerHTML: script_text});

    script_error_msg = '';
    win.onerror = (msg, url, ln, col) => {
        script_error_msg = msg + '\n\n' + [ln || '', col || ''].join(':');
    };
    win.document.body.append(script_el);

    iframe.remove();

    if (script_error_msg)
        return {};
    return Object.fromEntries(Object.keys(win).filter(k => !win_keys.has(k)).map(k => [k, win[k]]));
}
function update_functions(e) {
    const script_text = e.detail.state.doc.toString();
    $state.functions = script_text;
    replace_functions = get_methods(script_text);
}
onMount(() => {
    editor.$$.ctx[editor.$$.props.set_value]($state.functions);
});
</script>

<style>
.wrapper {
  height: 100vh;
}
header {
  border-bottom: 2px solid grey;
  margin-bottom: 1rem;
  padding: 0.5rem 0;
}
header h3 {
  margin: 0;
}
h3 {
  font-family: sans-serif;
  text-transform: uppercase;
  padding: 0 0.2rem;
  margin-bottom: 0;
  font-weight: bold;
}

input[type=text] {
  font-family: monospace, NoName;
}

textarea:focus, .textarea:focus {
  outline: none;
  --border-color: #3880bf;
}
.textarea.input {
  border-right: 2px solid;
}
textarea.output, .textarea.output {
  border-left: 2px solid;
}
.textarea {
  white-space: break-spaces
}
textarea, .textarea {
  width: 100%;
  padding: 0.3rem 0.2rem;
  border: 0;
  border-radius: 0;
  border-top: 2px solid;
  resize: none;
}
.textarea, .overflow-auto {
  overflow: auto
}

ol.repl-list > li {
  margin: 0.2rem 1rem 0.2rem 0;
  flex-wrap: wrap;
}
ol.repl-list > li::marker {
  font-size: 1.2rem;
  font-weight: bold;
}

ol.repl-list > li > div> .input-wrapper {
  flex: 1;
  margin: 0 7px;
}
.split {
  outline: none;
  background: #eee;
}
.split :global(span) {
  font-family: monospace, NoName;
  display: inline-block;
  padding: 0 0.5px;
  min-width: 0.6rem;
}
ol.repl-list > li.disabled .input-wrapper {
  background-color: #fafafa;
}
.match-count {
  display: inline-block;
  width: 2rem;
  text-align: center;
}

.more-btn { padding: 0; }
.more-btn > svg {
  transition: transform 200ms;
}
.more-btn.expanded > svg {
  transform: rotate(-180deg);
}
h3 + .icon {
  width: 1.2rem;
  height: 1.2rem;
}

.input-wrapper {
  border: 1px solid #aaa;
  transition: border-color ease-in-out .15s, box-shadow ease-in-out .15s;
  border-radius: 4px;
  background: white;
}
.input-wrapper:focus-within {
  border-color: #66afe9;
  outline: 0;
  box-shadow: inset 0 1px 1px #0001, 0 0 8px #66afe999;
}
.input-wrapper input {
  border: 0;
  box-shadow: none;
  outline: none;
  flex: 1;
  padding: 0.3rem;
  background: inherit;
  margin: 0;
}

input.fn, input.fn + :global(button) {
  background: #f0f0f0;
}
.arrow-down {
  display: inline-block;
  transform: rotate(90deg);
}
.arrow-up {
  display: inline-block;
  transform: rotate(-90deg);
}
.action-wrap {
  padding: 0.3rem 0.2rem;
}
@media (max-width: 850px) {
  ol.repl-list > li:first-child > div {
    margin-top: 0;
  }
  ol.repl-list > li > div {
    flex-wrap: wrap;
    margin: 1rem 0;
  }
  ol.repl-list > li > div > .input-wrapper {
    flex-basis: 100%;
    margin: 0.2rem 0;
  }
}
.flex-wrap {
  flex-wrap: wrap;
}
.flex-basis-500 {
  flex-basis: 400px;
}

.popover-menu-checkboxes :is(button, a) {
  max-width: 15rem;
  width: 100%;
  padding: 0.15rem 0.3rem;
  text-align: left;
}
.popover-menu-checkboxes :is(button:hover, a:hover) {
  background: #eee;
}
</style>
