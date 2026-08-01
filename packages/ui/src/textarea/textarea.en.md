---
slug: textarea
name: Textarea
category: forms
group: basic
tags: []
exports: [Textarea, textareaVariants]
status: enriched
---

# Textarea

> Multi-line input · Adaptive height · forms/basic

## When to use

Use Textarea for multiline notes, descriptions, or messages. Use [Input](../input/input.md) for one line, or [Select](../select/select.md) for a fixed option. Enable `autoResize` to grow with content while treating `rows` as the minimum height. Inside HulianUI Field, label, error, and ARIA associations are inherited automatically.

## Import
```ts
import { Textarea, textareaVariants } from "@hulianui/ui"
```

## Props

Inherit the native `<textarea>` properties (except `size` is overwritten, such as `value`/`onChange`/`rows`/`placeholder`/`disabled`…).

| Name | Type | Default | Description |
|------|------|------|------|
| size | `"sm" ｜ "md" ｜ "lg"` | `"md"` | Size (CVA variant, overrides native size) |
| invalid | `boolean` | `false` | Marked red when used independently; automatically driven by Field.Root invalid in hulian Field |
| autoResize | `boolean` | `false` | Adapt height according to content (JS scrollHeight, `rows` is the lower limit) |
| rows | `number` | `3` | Initial/minimum row height |
| disabled | `boolean` | `false` | Disable |

## Events

| Event | Type | Description |
|------|------|------|
| onChange | `(e: ChangeEvent<HTMLTextAreaElement>) => void` | Transparently transmit native input callback (used with `value` when controlled) |

## Example
```tsx
<Textarea placeholder="Write something…" className="w-64" />
```
```tsx
{/* Adaptive height */}
<Textarea autoResize defaultValue={"Grows with content\nSecond line\nThird line"} className="w-64" />
```

## Usage guidelines

- See [[base-ui-field-control-render-textarea-type-safe]] when extending a Field-aware Textarea. Base UI Field has no Textarea primitive, so textarea-specific props such as `ref`, `rows`, and `onInput` belong on the `render` element rather than `Field.Control`; otherwise TypeScript rejects the ref or Field accessibility wiring is silently lost.
- Do not repeat `invalid` inside HulianUI Field; Field.Root drives it automatically.

## Related
[Input](../input/input.md) · [Select](../select/select.md) · [Checkbox](../checkbox/checkbox.md) · [CheckboxGroup](../checkbox-group/checkbox-group.md) · [Radio](../radio/radio.md) · [Switch](../switch/switch.md)
