<div class="wrapper flex-column">
<header><h3>Replacer</h3></header>

<div class="text-right">
  <div class="inline-block my-2 px-1"><Toggle text="Live evaluation" bind:value={live_eval}/></div>
  <button class=btn on:click={() => { $state.repls = [...$state.repls, new_repl()] }}>+ Add input</button>
  <button class=btn on:click={() => modal_show(ImportExport)}><icon id=import-export> Import / Export</button>
  <button class=btn on:click={() => modal_show(ReplPresets, {callback: add_repls})}>Repls</button>
</div>

<ol class=repl-list>
{#each $state.repls as repl, i (repl.id)}
<li class:disabled={!repl.enabled} use:show_tip={repl_errors[i]} transition:slide|local animate:flip={{duration: 400}}>
  <div class="flex">
    <!-- Search -->
    <div class=input-wrapper>
      <div class=flex>
        <input bind:value={repl.search} type=text placeholder="search pattern">
        <Popover>
          <button class="text-sm px-1" slot=button let:show on:click={show} title="RegExp flags" hidden={!repl.search_is_regex}><icon id=chevron-bottom> {@html prep_flags(repl.flags)}</button>
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
        <button class=btn class:active={repl.search_is_regex} on:click={() => repl.search_is_regex = !repl.search_is_regex}><code>.*</code></button>
      </div>
      {#if /\p{sc=Arabic}|\p{scx=Arabic}/u.test(repl.search)}
        <div class=split contenteditable on:cut={e => {e.preventDefault()}} on:paste={e => {e.preventDefault()}} on:keydown={allow_special}>{@html split_regex(repl.search)}</div>
      {/if}
    </div>

    <!-- Replace -->
    <div class="input-wrapper flex items-start">
      {#if repl.replace_is_fn}
        <div class=flex-1><CodeMirror value={repl.replace} on:input={e => {repl.replace = e.detail}} max_height={300}/></div>
      {:else}
        <input bind:value={repl.replace} type=text placeholder="replace with">
      {/if}
      <button on:click={() => repl.replace_is_fn = !repl.replace_is_fn} class=btn class:active={repl.replace_is_fn}>ƒ()</button>
    </div>

    <!-- Options -->
  <div class="flex align-center space-s-2">
    <Toggle bind:value={repl.enabled}/>
    <Popover>
      <button class=btn slot=button let:show on:click={show} title=Actions><icon id=chevron-bottom></button>
      <div class="popover flex action-wrap">
          <button class=btn on:click={() => remove_repl(i)}>✕</button>
          {#if i > 0}
            <button class=btn on:click={() => move_repl(i, -1)}><icon id=arrow-up></button>
          {/if}
          {#if (i + 1) < $state.repls.length}
            <button class=btn on:click={() => move_repl(i, 1)}><icon id=arrow-down></button>
          {/if}
      </div>
    </Popover>
  </div>
</div>
</li>
{/each}
</ol>

<button on:click={() => { editor_shown = !editor_shown; }} class="flex flex-end more-btn mt-3" class:expanded={editor_shown}>
  <h3>Replacement functions</h3> <icon id=chevron-bottom>
</button>
<div use:show_tip={script_error_msg} style="border: 1px solid #aaa">
  <CodeMirror value={$state.functions} on:input={debounce(update_functions, 1000)} max_height={editor_shown ? 500 : 0}/>
</div>

<div class="flex flex-1 flex-wrap mt-3" style="min-height: 500px">
  {#if show_input}
  <div class="flex-column flex-1 flex-basis-500 h-full">
    <h3>Input</h3>
    <div class="textarea flex-1 input" dir=auto contenteditable=plaintext-only bind:this={input_el}
      on:blur={e => {input = e.target.innerText;}}
      on:paste={e => {let data = e.clipboardData.getData('text/plain'); setTimeout(() => {input = data}, 100);}}>{input}</div>
  </div>
  {/if}

  <div class="flex-column flex-1 flex-basis-500 h-full">
    <div class="flex space-s-2">
      <h3>Output</h3>
      <button class=btn on:click={() => {copy_text(output); notifier.info('Copied')}}><icon id=copy></button>
      <Toggle text=diff bind:value={show_diff}/>
      {#if show_diff}
        {changes_count} changes
      {/if}
    </div>
    {#if show_diff}
      <Diff bind:changes_count a={input} b={output}/>
    {:else}
      <CodeMirrorPlain value={output}/>
    {/if}
  </div>
</div>
</div>

<script>
import CodeMirror from './CodeMirror.svelte';
import CodeMirrorPlain from './CodeMirrorPlain.svelte'
import Toggle from 'components/src/Toggle.svelte'
import Popover from 'components/src/Popover.svelte'
import ImportExport from './ImportExport.svelte';
import ReplPresets from './ReplPresets.svelte'
import Diff from './Diff.svelte';
import {state} from './store.js';
import {debounce, unescape} from './util/util.js';
import {copy_text} from 'components/src/util.js'
import {show as modal_show} from 'components/src/Modal.svelte'
import {options as tip_options} from 'components/src/Tooltip.svelte'
import {notifier} from 'notifier'

export let input = $state.input || ''
export let more_methods = ''

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
const get_id = () => Math.random().toString(16).slice(2, 8)

function add_repls(repls) {
    repls = repls.map(repl => {
        const props = {
            id: get_id(),
            search: repl[0].toString(),
            replace: repl[1].toString(),
        }
        if (repl[0] instanceof RegExp) {
            props.flags = repl[0].flags.split('')
            props.search = props.search.slice(1, props.search.lastIndexOf('/'))
        }
        if (typeof repl[1] === 'function')
            props.replace_is_fn = true
        return new_repl(props)
    })
    $state.repls = [...$state.repls, ...repls]
}

const new_repl = props => ({
    enabled: true,
    id: props?.id || get_id(),
    search_is_regex: true,
    replace_is_fn: false,
    search: '',
    replace: '',
    flags: ['m', 'u', 'g'],
    ...props,
});

let repl_errors = [];
let editor;
let matches = [];
if (!$state.repls.length)
    $state.repls = [new_repl(), new_repl()]

let changes_count = -1
let output = ''
let input_el;
let live_eval = true;
let show_diff = 0
let show_input = true

let editor_shown = false;
let script_error_msg = '';
let replace_functions = {};

const prep_flags = flags => regex_flags.map(([f]) => flags.includes(f) ? `<b>${f}</b>` : `<span class=text-gray-400>${f}</span>`).join('');
function toggle_flag(repl, flag) {
    // Flags isn't a set to keep parsing and serializing simple
    const index = repl.flags.indexOf(flag);
    if (index === -1)
        repl.flags.push(flag);
    else
        repl.flags.splice(index, 1);
}

async function prep_repl(repl, i) {
    let {search, replace} = repl
    if (repl.search_is_regex) {
        try {
            let {flags} = repl;
            if (flags.includes('h')) {
                flags = flags.filter(flag => flag !== 'h');
                search = harakat_prep(repl.search);
            }
            search = new RegExp(search, flags.join(''))
        }
        catch (error) {
            repl_errors[i] = error.message
            return ['', '']
        }
    }
    else
        search = unescape(repl.search)

    try {
        replace = repl.replace_is_fn ? await prep_fn(`${$state.functions}\n${more_methods}\nexport default ${replace}`) : unescape(replace)
    }
    catch (error) {
        repl_errors[i] = error.message
        return ['', '']
    }
    return [search, replace]
}

const split_regex = s => s.replace(/./g, m => `<span class=${/\p{gc=Mn}/u.test(m) ? 'harakah' : ''}>${m}</span>`);

$: if (live_eval && input) {
    $state.input = input
    repl_errors = [];
    const repls = $state.repls.filter(r => r.enabled && r.search).map(prep_repl)
    Promise.all(repls).then(repls => {
        output = apply_repls(input, repls)
    })
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

async function prep_fn(script_text) {
    const create_el = (tag, attrs) => Object.assign(document.createElement(tag), attrs)
    const blob = new Blob([script_text], {type: 'application/javascript'})
    const url = URL.createObjectURL(blob)
    const script_el = create_el('script', {type: 'module', src: url})
    document.body.appendChild(script_el)
    const fn = (await import(/* @vite-ignore */ url)).default
    script_el.remove()
    return fn
}
function update_functions(e) {
    const script_text = e.detail
    $state.functions = script_text;
}
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

.textarea {
  white-space: break-spaces;
  width: 100%;
  padding: 0.3rem 0.2rem;
  border: 0;
  border-radius: 0;
  border-top: 2px solid;
  resize: none;
  overflow: auto;
}
.textarea:focus {
  outline: none;
  --border-color: #3880bf;
}
.textarea.input {
  border-right: 2px solid;
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
