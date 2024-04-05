<div class=cm-wrapper use:add_to_dom style="--max_height: {max_height}px"></div>

<script>
import {EditorView, basicSetup} from 'codemirror'
import {keymap} from '@codemirror/view'
import {javascript} from '@codemirror/lang-javascript'
import {indentWithTab} from '@codemirror/commands'
import {indentUnit} from '@codemirror/language'
import {EditorState} from '@codemirror/state'
import {createEventDispatcher} from 'svelte'

export let value = ''

const dispatch = createEventDispatcher()
const extensions = [
    basicSetup,
    indentUnit.of('    '),
    keymap.of([indentWithTab]),
    javascript(),
    EditorView.updateListener.of(v => {
        if (v.docChanged)
            dispatch('input', v.state.doc.toString())
    }),
]
const editor = new EditorView({doc: value, extensions})

export const get_value = () => editor.state.doc.toString();
export function set_value(value) {
    editor.setState(EditorState.create({doc: value, extensions}))
}
export let max_height = 500;

const add_to_dom = el => { el.append(editor.dom) }
</script>

<style>
.cm-wrapper {
  max-height: var(--max_height);
  overflow: auto;
  transition: max-height 500ms;
}
.cm-wrapper :global(.cm-editor) {
  padding: 0.1px;
}
.cm-wrapper :global(.cm-editor.cm-focused) {
  outline: none;
}
</style>
