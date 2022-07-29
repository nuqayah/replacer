<div class=cm-wrapper use:add_to_dom style="--max_height: {max_height}px"></div>

<script>
import {EditorView, basicSetup} from 'codemirror'
import {keymap} from '@codemirror/view'
import {javascript} from '@codemirror/lang-javascript'
import {indentWithTab} from '@codemirror/commands'
import {indentUnit} from '@codemirror/language'

const editor = new EditorView({
    extensions: [
        basicSetup,
        indentUnit.of('    '),
        keymap.of([indentWithTab]),
        javascript(),
        EditorView.updateListener.of(v => {
            if (v.docChanged)
                dispatch('change', v)
        }),
    ],
});

export const get_value = () => editor.state.doc.toString();
export function set_value(value) {
    editor.dispatch({
        changes: {from: 0, to: editor.state.doc.length, insert: value},
    });
}
export let max_height = 500;

const add_to_dom = el => { el.append(editor.dom); };
</script>

<style>
.cm-wrapper {
  max-height: var(--max_height);
  overflow: auto;
  border: 1px solid #aaa;
  transition: max-height 500ms;
}
.cm-wrapper :global(.cm-editor.cm-focused) {
  outline: none;
}
</style>
