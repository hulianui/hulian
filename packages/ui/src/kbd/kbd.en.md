---
slug: kbd
name: Kbd
category: typography
group: code
tags: []
exports: [Kbd, KbdGroup]
status: enriched
---

# Kbd

> Keyboard key · Monospace `<kbd>` styling plus the KbdGroup shortcut container + RSC · typography/code

## When to use

Use Kbd to label an individual key such as `Esc`, `⌘`, or `K`. Wrap key combinations such as `⌘ + K` in `KbdGroup` from the same directory: it owns the gap, draws the separator, and gives the whole combination one accessible name. Both work in server components. Use [CodeBlock](../code-block/code-block.md) or [Snippet](../snippet/snippet.md) for code instead.

## Import
```ts
import { Kbd, KbdGroup } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| ...HTMLAttributes | `HTMLAttributes<HTMLElement>` | - | supports `<kbd>` native attributes (className, style, etc.) |

### KbdGroup Props

| Name | Type | Default | Description |
|------|------|------|------|
| keys | `ReactNode[]` | - | Key names, each wrapped in a Kbd. The usual way to write a combination |
| separator | `ReactNode` | `"+"` | Separator between keys. Decorative only (`aria-hidden`, never announced). Pass `null` to keep the spacing without drawing a symbol |
| label | `string` | - | Accessible name for the whole combination, such as "Open command palette". `role="group"` is added only when it is present |
| ...HTMLAttributes | `HTMLAttributes<HTMLSpanElement>` | - | supports native attributes of the wrapping `<span>`. The rest spread comes first, so the `role` and `aria-label` the component computes win (see Usage guidelines) |

## Slots

| Slot | Type | Description |
|------|------|------|
| children | `ReactNode` | Key content for Kbd. On KbdGroup it means you lay out the keycaps yourself, and `keys` is ignored |

## Examples
```tsx
<Kbd>Esc</Kbd>

// Key combination: the keys array is the usual form
<KbdGroup keys={["⌘", "K"]} label="Open command palette" />

// Change the separator, or drop it
<KbdGroup keys={["⌘", "⇧", "P"]} separator="·" />
<KbdGroup keys={["G", "T"]} separator={null} />

// Switch to children when one key needs its own styling or content
<KbdGroup label="Save">
  <Kbd className="min-w-8">⌘</Kbd>
  <Kbd>S</Kbd>
</KbdGroup>
```

## Usage guidelines

- One Kbd renders one keycap and never adds a `+`. Reach for `KbdGroup` instead of hand-rolling `inline-flex + gap + separator` at every call site, otherwise the spacing and separator styling drift apart across the app.
- Without `label`, KbdGroup adds no `role="group"` and a screen reader announces the keycaps as unrelated fragments. Nothing about the rendered output looks different, which is exactly why this step gets skipped: whenever the combination stands for a concrete action, put that action name in `label`.
- When both `children` and `keys` are present only `children` is rendered; `keys` is ignored, because honouring both has no sensible meaning.
- **A `role` you pass cannot override the component's own `role="group"`**. The rest spread comes first on the root node, see [consuming.md §7](https://github.com/hulianui/hulian/blob/master/docs/consuming.md). Without `label` the component claims no role, so whatever you pass is what you get.
- No symbol mapping is built in (`Meta → ⌘`, `Ctrl → ⌃`, and so on). How a key should read depends on the platform detection and wording rules of the consuming app, so a built-in table would guess wrong in any cross-platform product.

## Related
[Code](../code/code.md) · [CodeBlock](../code-block/code-block.md) · [Snippet](../snippet/snippet.md) · [CodeDiff](../code-diff/code-diff.md) · [Text](../text/text.md) · [Heading](../heading/heading.md)
