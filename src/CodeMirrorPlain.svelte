<div class=cm-wrapper use:add_to_dom dir=auto />

<script>
import {EditorView, drawSelection, keymap} from '@codemirror/view'
import {EditorState, EditorSelection} from '@codemirror/state'
import {defaultKeymap, history, historyKeymap} from '@codemirror/commands'

export let value = ''
$: if (value)
    set_value(value)

const dispatch = createEventDispatcher()
const add_to_dom = el => { el.append(editor.dom) }

const editor = new EditorView({
    doc: value,
    extensions: [
        keymap.of([...defaultKeymap, ...historyKeymap]),
        history(),
        drawSelection(),
        EditorState.readOnly.of(true),
        EditorView.lineWrapping,
        EditorView.updateListener.of(v => {
            if (v.docChanged)
                dispatch('input', v.state.doc.toString())
        }),
    ],
})
export const get_value = () => editor.state.doc.toString()
export function set_value(value) {
    if (value !== get_value())
        editor.dispatch({
            changes: {from: 0, to: editor.state.doc.length, insert: value},
        })
}
export function go(line, col=0) {
    const {state} = editor
    const docLine = state.doc.line(Math.max(1, Math.min(state.doc.lines, line)))
    editor.dispatch({
        selection: EditorSelection.cursor(docLine.from + Math.max(0, Math.min(col, docLine.length))),
        scrollIntoView: true,
    })
    editor.focus()
}
</script>

<style>
.cm-wrapper {
  border: 1px solid #aaa;
  overflow: auto;
  height: 100%;
}
.cm-wrapper :global(.cm-editor) {
  padding: 0.1px;
  overflow: auto;
  height: 100%;
}
.cm-wrapper :global(.cm-editor .cm-scroller) {
  font-family: inherit;
  line-height: 1.6;
  overflow: auto;
}
</style>
