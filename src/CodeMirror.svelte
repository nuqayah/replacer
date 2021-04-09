<div class=cm-wrapper use:add_to_dom style="--max_height: {max_height}px"></div>

<script>
import {keymap} from '@codemirror/view';
import {EditorState, EditorView, basicSetup} from '@codemirror/basic-setup';
import {javascript} from '@codemirror/lang-javascript';
import {defaultTabBinding} from '@codemirror/commands';
import {indentOnInput, indentUnit} from '@codemirror/language';

const extensions = [
    basicSetup,
    indentUnit.of('    '),
    keymap.of([defaultTabBinding]),
    javascript(),
    EditorView.updateListener.of(v => {
        if (v.docChanged)
            dispatch('change', v);
    }),
];
const editor = new EditorView({
    state: EditorState.create({extensions}),
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
