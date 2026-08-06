---
slug: code-editor
name: CodeEditor
category: forms
group: advanced
tags: []
exports: [CodeEditor, applyEdit, autoPairEdit, backspacePairEdit, getLanguageRules, indentEdit, lineEndAt, lineStartAt, newlineEdit, outdentEdit, selectedLineBlock, splitTokensByLine, toggleCommentEdit, tokenizeCss, tokenizeEditorCode]
status: enriched
---

# CodeEditor

> Code editor · dependency-free transparent textarea over a highlight layer, with no CodeMirror or Monaco · controlled value and onChange, line-number gutter, active-line highlight, syntax colors reusing the CodeBlock tokenizer for the JS family, JSON, and Shell plus a built-in CSS scanner · full keyboard support (Tab indent, Shift+Tab outdent, Enter keeps indent, auto-closing and wrapping pairs, paired backspace, Cmd/Ctrl + slash comment toggle) that always writes through execCommand so the native undo stack survives · edit intents are exported as tested pure functions · built for inspecting and editing AI-generated DSL or JSON · forms/advanced

## When to use

Use CodeEditor when the user has to **change** code: an inspector for AI-generated DSL or a JSON AST, a config snippet, a template.
Use [CodeBlock](../code-block/code-block.md) for read-only display with a copy button, [Snippet](../snippet/snippet.md) for a single command, [Code](../code/code.md) for inline fragments, and [CodeDiff](../code-diff/code-diff.md) to compare two versions.
Use [MarkdownEditor](../markdown-editor/markdown-editor.md) for prose with a toolbar and preview.

For a real IDE experience with folding, completion, semantic diagnostics, or multiple cursors, embed CodeMirror 6 or Monaco instead. This component is a lightweight controlled `value`/`onChange` field; when you embed an engine, borrow the skin here (color tokens, gutter, border, focus ring) rather than the engine.

## Import
```ts
import { CodeEditor, applyEdit, autoPairEdit, backspacePairEdit, getLanguageRules, indentEdit, lineEndAt, lineStartAt, newlineEdit, outdentEdit, selectedLineBlock, splitTokensByLine, toggleCommentEdit, tokenizeCss, tokenizeEditorCode } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| value * | string | — | Controlled code text. **Must be written back from onChange**, otherwise every edit is rolled back by React. |
| language | CodeEditorLanguage | "tsx" | Selects the tokenizer, comment markers, and pair rules. `typescript` \| `tsx` \| `javascript` \| `jsx` \| `json` \| `css` \| `bash` \| any string (unknown values fall back to the JS family). |
| readOnly | boolean | false | Read-only. Focus, selection, and copy still work; input and keyboard shortcuts do not. |
| lineNumbers | boolean | true | Shows the gutter, pinned horizontally and following vertical scroll. |
| highlightActiveLine | boolean | true | Highlights the caret line while the editor is focused. |
| lineHeight | number | 1.6 | Unitless line-height applied to both the gutter and the code area. |
| tabSize | number | 2 | Width of one indent level in spaces; also used as `tab-size`. |
| placeholder | string | — | Placeholder shown when the value is empty. |
| rows | number | 12 | Default visible rows; an explicit height on `className` wins. |
| theme | "light" \| "dark" | — | Forced theme escape hatch. Omit it to follow the global `[data-theme]`, which is the recommended usage. |
| ariaLabel | string | From locale | Accessible name; without it the editor takes a generic code-editor label plus the language from the ConfigProvider locale. |
| className | string | — | Wrapper class for width, height, or max height. |

## Events

| Event | Type | Description |
|------|------|------|
| onChange | (value: string) => void | Fires for plain typing and every keyboard shortcut alike; write `value` back from it. |
| onFocus | () => void | The editing area gained focus. |
| onBlur | () => void | The editing area lost focus. |

## Keyboard

| Key | Behavior |
|------|------|
| Tab | Indents every line of a multi-line selection; otherwise inserts one indent at the caret. Focus never leaves. |
| Shift + Tab | Outdents every line the selection covers, or the current line when the selection is collapsed. |
| Enter | Keeps the previous indent, adds one level after `{` `[` `(`, and pushes the closing token to its own line when the caret sits between a pair. |
| `{` `[` `(` `"` `'` `` ` `` | Auto-closes the pair. **With a selection it wraps instead of replacing**, and the inner text stays selected. |
| Closing token or quote | Types over an identical adjacent closer instead of inserting a duplicate. |
| Backspace | Deletes both characters when the caret sits inside an empty pair. |
| Cmd / Ctrl + / | Toggles line comments per language. CSS falls back to wrapping each line in `/* */`; JSON has no comments and does not respond. |
| Cmd / Ctrl + Z | Native undo, stepping back through each shortcut edit. |

## Exported pure functions

Edit intent and the actual write are separate. The functions below only compute which range becomes what text and where the caret lands (`EditorEdit`). They never touch the DOM, are unit tested on their own, and can drive your own editor.

| Function | Description |
|------|------|
| getLanguageRules(lang, indentSize) | Indent unit, comment markers, and pair rules for a language. |
| indentEdit \| outdentEdit | Tab and Shift+Tab indent and outdent, including per-line batching. |
| newlineEdit | Enter with indent continuation and pair expansion. |
| autoPairEdit(state, ch, rules) | Auto-close, selection wrapping, and type-over; null means let the browser insert normally. |
| backspacePairEdit | Deletes both halves of an empty pair. |
| toggleCommentEdit | Line comment toggle, with the CSS block fallback and the JSON no-op. |
| applyEdit(state, edit) | Applies one EditorEdit to `{ value, selectionStart, selectionEnd }`. |
| lineStartAt \| lineEndAt \| selectedLineBlock | Line-position helpers. |
| tokenizeCss \| tokenizeEditorCode \| splitTokensByLine | The CSS scanner, language dispatch, and per-line token splitting. |

## Examples
```tsx
const [code, setCode] = useState(source);

// Basic: edit AI-generated TSX
<CodeEditor value={code} onChange={setCode} language="tsx" rows={12} />

// DSL in an inspector: fixed height with inner scroll and four-space indent
<CodeEditor
  value={dsl}
  onChange={setDsl}
  language="json"
  tabSize={4}
  className="h-[320px] w-full"
/>

// Read-only preview, still selectable and copyable
<CodeEditor value={code} language="css" readOnly rows={8} />

// Narrow sidebar: no gutter, no active line, tighter leading
<CodeEditor
  value={code}
  onChange={setCode}
  lineNumbers={false}
  highlightActiveLine={false}
  lineHeight={1.4}
  rows={6}
/>
```

## Accessibility

- The editable surface is a native `<textarea>`, so screen readers, keyboard handling, IME composition, and the mobile long-press selection menu are all browser behavior, without the pitfalls of a hand-rolled `contenteditable`.
- The highlight layer and the gutter are `aria-hidden`, so the same code is not announced twice.
- The default accessible name comes from the locale (a generic code-editor label plus the language), so it follows the app language. Pass `ariaLabel` when several editors share a screen; priority is `ariaLabel` prop, then the locale, then the built-in Chinese fallback.
- `readOnly` is reflected on both `readonly` and `aria-readonly`.
- Because Tab is taken by indentation, **focus cannot be moved out with Tab**. Every code editor makes this trade-off; provide another way to move focus (Shift+Tab is taken by outdent too), or use `readOnly` for view-only cases.
- The focus ring is drawn on the wrapper via `focus-within` rather than on the textarea, so it does not stack into a double line with the 1px border.

## Pitfalls

- **It must be controlled.** If `onChange` does not write `value` back, edits are rolled back immediately and it looks like typing does nothing. That is by design, not a bug.
- **Do not bypass the component and expect undo to survive.** Every shortcut writes through `document.execCommand("insertText" | "delete")` so the change lands in the native undo stack. If you fork this and replace that with a whole-document `setState`, Cmd+Z stops working instantly; this is the single easiest thing to get wrong in a textarea-based editor. Where `execCommand` is unavailable (jsdom, very old browsers) the component falls back to emitting the whole document, so editing still works but native undo is lost.
- **There is no `minimap` prop.** The original request mentioned one and it is deliberately omitted: a real minimap needs the whole document re-rendered at sub-pixel scale with viewport sync and drag scrubbing, which no dependency-free implementation can honestly provide, and shipping a density bar under the name `minimap` would teach consumers the wrong mental model. The main use case is the right-hand inspector of a three-column workspace, where horizontal space is the scarcest axis and a minimap would eat 60-80px. Embed Monaco if you need one.
- **Not implemented**: code folding, completion, multiple cursors and column selection, semantic diagnostics and squiggles, a find-and-replace panel, and bracket-match highlighting. Embed CodeMirror 6 or Monaco for those.
- Text never wraps (`wrap="off"`; long lines scroll horizontally). This is deliberate: with soft wrapping the gutter can no longer line up with visual rows, so `lineNumbers` would start lying. Use [Textarea](../textarea/textarea.md) if you want wrapping.
- **Styling changes must be applied to all three layers.** The transparent `<textarea>`, the colored `<pre>`, and the gutter must agree on font family, font size, line height, padding, `white-space`, and `tab-size`. Change padding or font size on only one of them and the caret drifts half a character, visible only on long lines or deep indentation.
- **`theme` now holds in both directions** (since @hulianui/tokens 0.3.0): a light island inside a dark page sticks just as well as a dark island inside a light page, and the island also owns its `dark:` utilities, shadows and hairline borders. Older versions only supported the dark-inside-light direction (hulianui/hulian#101). Omitting `theme` and following the global theme is still the recommended usage — a forced theme is an escape hatch, not the default.
- Highlighting is **approximate, not a parser**. The CSS scanner only tracks whether it is inside `{}` and whether it has passed a `:`; the JS family reuses the single-regex scanner from CodeBlock. Complex generics, regex literals, and nested template strings may be colored wrong. Coloring never affects editing, and `value` is always your exact text.
- With `language="json"`, Cmd+/ **deliberately does nothing**: JSON has no comments, so inserting one would produce invalid JSON.
- The selection background is a translucent `bg-primary/25` because the textarea paints above the highlight layer and an opaque selection would hide the code. If you change that class, re-check contrast in the dark theme.

## Related
[CodeBlock](../code-block/code-block.md) · [CodeDiff](../code-diff/code-diff.md) · [Code](../code/code.md) · [Snippet](../snippet/snippet.md) · [MarkdownEditor](../markdown-editor/markdown-editor.md) · [JsonViewer](../json-viewer/json-viewer.md) · [Textarea](../textarea/textarea.md)
