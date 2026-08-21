---
slug: code-diff
name: CodeDiff
category: typography
group: code
tags: []
exports: [CodeDiff, diffLines, diffStat]
status: enriched
---

# CodeDiff

> Shows line-oriented additions and removals in unified or split views with line numbers and a summary. · typography/code

## When to use

Use CodeDiff to compare two text versions during a pull-request review, agent-change inspection, or configuration audit. It shows additions and deletions with paired line numbers and supports line annotations. Use [CodeBlock](../code-block/code-block.md) for static code or [Snippet](../snippet/snippet.md) for a single-line command. `diffLines` and `diffStat` are pure functions that can also power custom rendering or statistics.

## Import
```ts
import { CodeDiff, diffLines, diffStat } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| oldText* | `string` | - | old text |
| newText* | `string` | - | new text |
| mode | `"unified" \| "split"` | `"unified"` | Unified single-column or split side-by-side comparison. |
| filename | `string` | - | Header file name bar; if omitted, the header will not be rendered. |
| showLineNumbers | `boolean` | `true` | Show line number slot |
| annotations | `CodeDiffAnnotation[]` | - | Row-anchored annotations: Insert full-width content slot below matching row rendering gutter tag + row (unified mode inserts content only) |
| className | `string` | - | Container class name |

`CodeDiffAnnotation` has the shape `{ side?: "old"\|"new"(default "new"); line: number(1-based); gutter?: ReactNode; content?: ReactNode }`.

## Examples
```tsx
<CodeDiff filename="greet.ts" oldText={OLD} newText={NEW} />

// Side-by-side comparison
<CodeDiff mode="split" filename="greet.ts" oldText={OLD} newText={NEW} />
```

## Usage guidelines

- The `content` slot in `annotations` is inserted only in unified mode. Split mode renders gutter markers only. Use `mode="unified"` to place a CodeReviewThread or other content below a changed line.
- `annotations[].line` is one-based, and `side` identifies the old or new file. Do not treat it as a zero-based array index.

## Related
[Code](../code/code.md) · [CodeBlock](../code-block/code-block.md) · [Snippet](../snippet/snippet.md) · [Kbd](../kbd/kbd.md) · [Text](../text/text.md) · [Heading](../heading/heading.md)
