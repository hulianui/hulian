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
| size | `"xs" \| "sm" \| "md" \| "lg"` | `"md"` | Size (CVA variant, overrides native size). `xs` is a 28px-tall, 12px-text density step for inline editors in dense legacy tables; it keeps its border, unlike the borderless `variant="cell"`. Under `variant="cell"` it only affects font size; height and padding are gone |
| variant | `"default" \| "cell"` | `"default"` | Shell form. `cell` is the in-place editor for a table cell: no border, transparent background, zero padding, no fixed row height, and focus is shown as a tinted background plus an inset underline instead of a focus ring |
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
```tsx
{/* Inline editing in a table: the cell itself is the input, no className needed */}
const columns: ColumnDef<Row, any>[] = [
  {
    accessorKey: "name",
    header: "Field name",
    cell: ({ row }) => (
      <Input
        variant="cell"
        value={row.original.name}
        onChange={(e) => setField(row.original.id, "name", e.target.value)}
        aria-label="Field name"
      />
    ),
  },
];
<Table columns={columns} data={rows} density="compact" />
```

## Usage guidelines

- Do not pass `invalid` again inside HulianUI Field. `Field.Root` supplies invalid styling automatically, and a manual value can conflict. Pass `invalid` only when Input is used independently.
- Use `variant="cell"` for in-place editing in a table instead of writing `className="border-0 bg-transparent p-0 focus-visible:ring-0 …"` at the call site. Beyond being the call-site patching the conventions forbid, two of its effects are hard to spot: `ring-0` does not clear `ring-offset` (a ring of background colour survives), and the default shell's fixed row height (`h-10`) is not padding, so `p-0` cannot remove it and dense rows stay tall.
- The focus indicator under `variant="cell"` is a tinted background plus an inset underline, not a focus ring: a cell has no padding, so a 2px ring with a 2px offset spills over into the neighbouring cell. If your scenario needs a stronger cue, change the whole cell background on the `<td>` rather than bringing the ring back.

## Related
[Textarea](../textarea/textarea.md) · [Select](../select/select.md) · [Checkbox](../checkbox/checkbox.md) · [CheckboxGroup](../checkbox-group/checkbox-group.md) · [Radio](../radio/radio.md) · [Switch](../switch/switch.md)
