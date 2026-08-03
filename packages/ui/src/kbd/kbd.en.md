---
slug: kbd
name: Kbd
category: typography
group: code
tags: []
exports: [Kbd]
status: enriched
---

# Kbd

> Keyboard key · Monospace `<kbd>` styling for individual keys and composed shortcuts + RSC · typography/code

## When to use

Use Kbd to label an individual key such as `Esc`, `⌘`, or `K`. Compose shortcuts from multiple Kbd elements side by side. It works in server components. Use [CodeBlock](../code-block/code-block.md) or [Snippet](../snippet/snippet.md) for code instead.

## Import
```ts
import { Kbd } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| ...HTMLAttributes | `HTMLAttributes<HTMLElement>` | — | supports `<kbd>` native attributes (className, style, etc.) |

## Slots

| Slot | Type | Description |
|------|------|------|
| children | `ReactNode` | Key content |

## Examples
```tsx
<Kbd>Esc</Kbd>

// Key combination: multiple Kbd side by side
<span className="inline-flex items-center gap-1">
  <Kbd>⌘</Kbd>
  <span className="text-muted">+</span>
  <Kbd>K</Kbd>
</span>
```

## Usage guidelines

- One Kbd renders one keycap. Compose combinations from multiple Kbd elements and add any `+` separator explicitly.

## Related
[Code](../code/code.md) · [CodeBlock](../code-block/code-block.md) · [Snippet](../snippet/snippet.md) · [CodeDiff](../code-diff/code-diff.md) · [Text](../text/text.md) · [Heading](../heading/heading.md)
