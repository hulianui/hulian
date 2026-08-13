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
| size | `"xs" \| "sm" \| "md" \| "lg"` | `"md"` | Size (CVA variant, overrides native size). `xs` matches the `xs` height of Input and SelectTrigger for dense tables. Under `variant="cell"` it only affects font size; there is no padding left to change |
| ref | `Ref<HTMLTextAreaElement>` | — | Forwarded to the inner native `<textarea>`. `focus()`, `select()`, reading `.value`, and react-hook-form `register()` all rely on it, and it coexists with the internal ref used by `autoResize` |
| variant | `"default" \| "cell"` | `"default"` | Shell form. `cell` is the in-place editor for a table cell: no border, transparent background, zero padding, height follows content through CSS `field-sizing: content`, and focus is shown as a tinted background plus an inset underline instead of a focus ring |
| value | `string \| number \| readonly string[] \| null` | — | Controlled value. Beyond the native types it **also accepts `null` and renders it as an empty string** (#220, same as [Input](../input/input.md)): `register().value` from [`useForm`](../form/form.md) passes an explicitly cleared `null` straight through. Omitting it (`undefined`) still means uncontrolled |
| invalid | `boolean` | `false` | Marked red when used independently; automatically driven by Field.Root invalid in hulian Field |
| autoResize | `boolean` | `false` | Adapt height according to content (JS scrollHeight, `rows` is the lower limit) |
| rows | `number` | `3` (`1` under `variant="cell"`) | Initial/minimum row height |
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
```tsx
{/* Inline editing in a table: the cell itself is a self-growing multi-line input, no className needed */}
<Textarea variant="cell" value={value} onChange={(e) => setValue(e.target.value)} aria-label="Note" />
```

## Usage guidelines

- `variant="cell"` and `autoResize` solve the same problem two ways: the former hands height to CSS `field-sizing: content` (native, no JavaScript round trip), the latter measures `scrollHeight` in JavaScript. **`cell` alone is the default choice.** `field-sizing` is a recent CSS feature; browsers without it fall back to the fixed height implied by `rows` — nothing breaks, the box simply stops growing. Pass `autoResize` alongside when you need to cover those browsers: it writes an inline `style.height`, which outranks the intrinsic size from `field-sizing`, so the two never fight.
- Use `variant="cell"` for in-place editing instead of writing `className="border-0 bg-transparent p-0 resize-none field-sizing-content …"` at the call site. The `rows` lower bound already defaults to `1` under `cell`, so there is no need to pass `rows={1}` per cell either.
- `variant="cell"` and `autoResize` do not accept a `resize-*` override, and **the override only half lands**: this variant emits `resize-none overflow-hidden`, and the two sit in different tailwind-merge groups, so `className="resize-y"` replaces `resize-none` while `overflow-hidden` stays untouched. The handle drags, but dragging smaller clips the content with no scrollbar (and `field-sizing-content` keeps sizing to content, fighting the inline height the handle writes). The component names the misuse through `console.warn` in development, once per variant. For a box the user can drag, switch to `variant="default"` and do not pass `autoResize`.
- See [[base-ui-field-control-render-textarea-type-safe]] when extending a Field-aware Textarea. Base UI Field has no Textarea primitive, so textarea-specific props such as `ref`, `rows`, and `onInput` belong on the `render` element rather than `Field.Control`; otherwise TypeScript rejects the ref or Field accessibility wiring is silently lost.
- Do not repeat `invalid` inside HulianUI Field; Field.Root drives it automatically.

## Related
[Input](../input/input.md) · [Select](../select/select.md) · [Checkbox](../checkbox/checkbox.md) · [CheckboxGroup](../checkbox-group/checkbox-group.md) · [Radio](../radio/radio.md) · [Switch](../switch/switch.md)
