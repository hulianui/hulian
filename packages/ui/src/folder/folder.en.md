---
slug: folder
name: Folder
category: data-display
group: collection
tags: [animated]
exports: [Folder]
status: enriched
---

# Folder

> 3D folder · click to fan out up to three papers, with magnetic pointer following, CSS transforms, token-derived color, and reduced-motion support · data-display/collection · #animated

## When to use

Use Folder as a playful expandable entry for a portfolio or file group. It opens up to three paper layers and applies magnetic pointer movement. Use FileTree or Tree for real hierarchical file navigation, or [Table](../table/table.md) for tabular data.

## Import
```ts
import { Folder } from "@hulianui/ui"
```

## Props

Inherits `<div>` attributes except `color` and `onClick`, which are redefined below.

| Name | Type | Default | Description |
|------|------|------|------|
| color | `string` | `var(--color-primary)` | Folder color. Accepts any CSS color; a theme token is recommended. |
| size | `number` | `1` | Scale relative to the 100 by 80 px base. |
| open | `boolean` | — | Controlled open state; pair with `onOpenChange`. |
| defaultOpen | `boolean` | `false` | Initial state in uncontrolled mode. |
| disableMagnet | `boolean` | `false` | Prevents open papers from following the pointer. |

## Events

| Event | Type | Description |
|------|------|------|
| onClick | `MouseEventHandler<HTMLButtonElement>` | Called when clicking the folder to toggle it. |
| onOpenChange | `(open: boolean) => void` | Called for open-state changes in both modes. |

## Slots

| Slot | Type | Description |
|------|------|------|
| items | `ReactNode[]` | Up to three paper contents. Extras are truncated and missing entries become blank papers. |

## Examples

```tsx
<Folder />

<Folder
  size={1.4}
  items={[
    <span key="1">Documents</span>,
    <span key="2">Images</span>,
    <span key="3">Videos</span>,
  ]}
/>
```

## Usage notes

- Only three items can render; extras are truncated and short arrays are padded.
- Controlled usage requires both `open` and `onOpenChange` or clicks cannot update state.
- Use full `--color-` token names; bare `var(--primary)` does not resolve.
- [[nextjs-app-router-underscore-private-folder-404]] concerns Next.js private route folders and does not apply to this component.

## Related
[Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md)
