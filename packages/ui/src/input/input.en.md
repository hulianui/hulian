---
slug: input
name: Input
category: forms
group: basic
tags: []
exports: [Input, inputShellVariants]
status: enriched
---

# Input

> Text input · Base UI Field integration with suffix and invalid styling · forms/basic

## When to use

Use Input for single-line text. Use [Textarea](../textarea/textarea.md) for multiple lines, [Select](../select/select.md) for fixed options, or [Switch](../switch/switch.md), [Checkbox](../checkbox/checkbox.md), and [Radio](../radio/radio.md) for on/off, multi-select, and single-select choices. Inside HulianUI Field, label, error, and ARIA relationships are applied automatically.

## Import
```ts
import { Input, inputShellVariants } from "@hulianui/ui"
```

## Props

Inherit the native `<input>` properties (except `size`/`prefix` are overridden below, such as `value`/`onChange`/`type`/`placeholder`/`disabled`…).

| Name | Type | Default | Description |
|------|------|------|------|
| size | `"sm" ｜ "md" ｜ "lg"` | `"md"` | Size (CVA variant, overrides native size) |
| invalid | `boolean` | `false` | Marked red when used independently; automatically driven by Field.Root invalid in hulian Field, no need to repeat the transmission |
| disabled | `boolean` | `false` | Disable |
| ref | `Ref<HTMLInputElement>` | — | Forward to the inner native `<input>` (not the shell span). `focus()` / `select()` / `register()` from `.value` / react-hook-form all rely on it |

## Events

| Event | Type | Description |
|------|------|------|
| onChange | `(e: ChangeEvent<HTMLInputElement>) => void` | supports native input callback (used with `value` when controlled) |

## Slots

| Slot | Type | Description |
|------|------|------|
| prefix | `ReactNode` | Prefix content (such as `¥`) |
| suffix | `ReactNode` | Suffix content (such as `.00`) |

## Examples
```tsx
<Input placeholder="Enter a value…" className="w-64" />
```
```tsx
{/* Prefix and suffix */}
<Input prefix="¥" suffix=".00" placeholder="0" className="w-64" />
```

## Usage guidelines

Do not pass `invalid` again inside HulianUI Field. `Field.Root` supplies invalid styling automatically, and a manual value can conflict. Pass `invalid` only when Input is used independently.

## Related
[Textarea](../textarea/textarea.md) · [Select](../select/select.md) · [Checkbox](../checkbox/checkbox.md) · [CheckboxGroup](../checkbox-group/checkbox-group.md) · [Radio](../radio/radio.md) · [Switch](../switch/switch.md)
