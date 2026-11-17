---
slug: code-block
name: CodeBlock
category: typography
group: code
tags: []
exports: [CodeBlock, HighlightedCode, tokenizeCode, type CodeToken, type CodeTokenType]
status: enriched
---

# CodeBlock

> Displays multiline code with an optional language label and copy action. · typography/code

## When to use

Use CodeBlock for multiline snippets with built-in syntax coloring, a language label, and one-click copy. Use [Snippet](../snippet/snippet.md) for a single-line command or identifier, [Code](../code/code.md) for inline `code`, or [CodeDiff](../code-diff/code-diff.md) for before-and-after changes.

## Import
```ts
import { CodeBlock, HighlightedCode, tokenizeCode, type CodeToken, type CodeTokenType } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| code* | `string` | - | Code text; use `\n` for multiple lines. |
| lang | `string` | - | Language name, such as `"tsx"`. When set, a header bar renders with the language on the left and the actions on the right; it also selects JavaScript-family, shell, or Python highlighting rules. Without it there is no header, and the actions float in the upper-right corner, appearing on hover or keyboard focus. |
| copyable | `boolean` | `true` | Whether to show the copy button. |
| highlight | `boolean` | `true` | Whether to apply syntax coloring; disable it for plain text. |
| lineNumbers | `boolean \| { start?: number }` | `false` | Whether to show a line-number gutter. Pass `{ start: 120 }` so a snippet is numbered from a given line; the gutter width follows the digits of the largest line number. |
| defaultWrap | `boolean` | `false` | Whether long lines start wrapped. By default they scroll horizontally to keep the original layout; when a line actually overflows, a "Wrap lines" toggle appears in the actions so readers can switch. Pass `true` for logs, long URLs, and long error messages. |
| maxLines | `number` | - | Collapse beyond this many lines: only the first `maxLines` lines show, with a bottom fade and a "Show all N lines" button. Blocks that exceed it by fewer than 3 lines are shown in full. |
| className | `string` | - | Additional class name for the container. |

## Highlighted languages

| lang | Rules |
|------|-------|
| `js` `jsx` `ts` `tsx` `json` | JavaScript family |
| `bash` `sh` `shell` `zsh` `console` | Shell (command names and flags get separate colors) |
| `py` `python` `python3` | Python (`#` comments, triple-quoted docstrings, `f`/`r`/`b` prefixed strings, decorators, builtins, and `0b`/`0o`/`0x`/underscore/imaginary literals) |
| `text` `txt` `plain` `plaintext` | Plain text, no coloring |
| Anything else | Approximated with the JavaScript-family rules |

## Examples
```tsx
<CodeBlock code={`import { Button } from "@hulianui/ui";`} lang="tsx" />

// Shell languages use shell highlighting rules
<CodeBlock code={`pnpm add @hulianui/ui`} lang="bash" />

// Python
<CodeBlock code={`def guess(n: int) -> str:\n    return f"you guessed {n}"`} lang="python" />

// Tutorials, docs, and code review: turn on the gutter when prose points at "line N"
<CodeBlock code={source} lang="python" lineNumbers />

// The snippet was cut from line 120 of the source file
<CodeBlock code={snippet} lang="python" lineNumbers={{ start: 120 }} />

// Collapse long code to 12 lines; wrap log-like content from the start
<CodeBlock code={source} lang="tsx" maxLines={12} />
<CodeBlock code={log} lang="text" defaultWrap />
```

## Usage guidelines

- **A `lang` without a dedicated branch is approximated, not supported.** Every language not listed in the table above is scanned with the JavaScript-family rules: the `#` comments of `yaml` / `toml` / `ini` / `dockerfile` and the `--` comments of SQL are not recognized, so comment bodies are scanned as code and words inside them may even be colored as JavaScript keywords. Either accept that, or pass `highlight={false}` so nothing is colored wrongly; open an issue if you need a real branch for your language.
- **Line numbers are decoration, not content.** The gutter is `aria-hidden` and cannot be selected: screen readers skip it, and selecting the whole block never drags `1 2 3` into the clipboard. The copy button always copies the original `code`. Conversely, do not treat the gutter as a source of copyable data.
- **The gutter stays pinned to the left** (`sticky left-0` plus an opaque background). Line numbers survive horizontal scrolling of long lines; the cost is that the scrolled code is hidden under a narrow strip. That trade is deliberate: on a long line, seeing the line number matters more than that strip of code.
- **The "Wrap lines" toggle only appears when a line really overflows.** It measures the `<pre>` `scrollWidth`, which is only known after mount, so the first server-rendered frame has no toggle (the header has a fixed height, so it appears without shifting layout). If log-like content should wrap right away, pass `defaultWrap` instead of waiting for readers to click.
- **Collapsing trims the display, not the content.** The copy button always copies the full `code`, and in-page find (⌘F) still matches collapsed lines, but a match does not expand the block.
- The copy button uses `navigator.clipboard`, which only exists in a secure context (HTTPS or localhost); on a plain HTTP page in a local network, clicking it copies nothing.

## Related
[Code](../code/code.md) · [Snippet](../snippet/snippet.md) · [CodeDiff](../code-diff/code-diff.md) · [Kbd](../kbd/kbd.md) · [Text](../text/text.md) · [Heading](../heading/heading.md)
