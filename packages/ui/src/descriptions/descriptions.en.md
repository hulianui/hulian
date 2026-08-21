---
slug: descriptions
name: Descriptions
category: data-display
group: collection
tags: []
exports: [Descriptions, DescriptionsItem]
status: enriched
---

# Descriptions

> Displays labeled record fields in horizontal or vertical, bordered or unbordered layouts. · data-display/collection

## When to use

Use Descriptions for flat read-only fields in a detail page or drawer, such as user, order, or contract information. Use [JsonViewer](../json-viewer/json-viewer.md) for nested JSON, or [List](../list/list.md) for an entry stream with actions.

## Import
```ts
import { Descriptions, DescriptionsItem } from "@hulianui/ui"
```

## Props

`DescriptionsProps`:

| Name | Type | Default | Description |
|------|------|------|------|
| column | `number` | `3` | **Maximum** columns per row; the effective count steps down with the container width (see below). |
| layout | `"horizontal" \| "vertical"` | `"horizontal"` | Places labels beside or above values. |
| bordered | `boolean` | `false` | Enables a bordered table-like layout. |
| size | `"sm" \| "md"` | `"md"` | Density step. `sm` tightens cell padding only and leaves the font size alone. |
| labelWidth | `number \| string` | - | Pins the label column (horizontal only). Left out, the widest label in the table sets it and every row lines up. Numbers are pixels. |
| emptyText | `ReactNode` | `"—"` | Placeholder for empty values. Empty means `null`, `undefined`, `""` or `false`; the number `0` still renders. Pass `null` to switch it off. |
| align | `"baseline" \| "start" \| "center"` | follows layout | Vertical alignment of label against value. Only needed when the value is taller than text (an image, a row of tags). |
| items | `DescriptionsItemData[]` | - | Data-driven entries, taking precedence over child items. |

`DescriptionsItemProps` (the `<DescriptionsItem>` used in the compound form)

| Name | Type | Default | Description |
|------|------|------|------|
| label | `ReactNode` | - | Key name. |
| span | `number` | `1` | Number of columns to span. |

## Slots

| Slot | Type | Description |
|------|------|------|
| title | `ReactNode` | Upper-left title. |
| extra | `ReactNode` | Upper-right actions. |

`DescriptionsItem` and `DescriptionsItemData` provide `label`, `children`, and `span`. Span defaults to 1 and is clamped to `column`.

## Examples
```tsx
<Descriptions title="User information">
  <DescriptionsItem label="Name">Alex Zhang</DescriptionsItem>
  <DescriptionsItem label="Gender">Male</DescriptionsItem>
  <DescriptionsItem label="Notes" span={3}>VIP customer; prioritize support requests</DescriptionsItem>
</Descriptions>

<Descriptions
  bordered
  title="Order details"
  extra={<a href="#edit">Edit</a>}
  items={[
    { label: "Username", children: "alex" },
    { label: "Address", children: "88 Example Road, Guangzhou", span: 3 },
  ]}
/>
```

## Label alignment and responsiveness

**The label column is sized once for the whole table, not per cell.** The outer grid opens one
label track and one value track per column, and every entry borrows those tracks through
`subgrid` -- so values line up down the column the way a `<table>` does, without anyone having to
guess a width. There is exactly one case for `labelWidth`: **two stacked tables that must agree**
(say "Profile" above "Execution log"), because each one would otherwise size its label column on
its own longest label.

**The column count follows the container width, not the viewport.** Detail views live in drawers
and split panes, where the viewport is wide while this block is 380px, so viewport breakpoints are
the wrong measure. Steps, by container width:

| Container width | Effective columns |
|---|---|
| < 32rem | 1 |
| 32-48rem | 2 |
| 48-64rem | 3 |
| >= 64rem | `column` |

An entry that spans more columns than a step allows **falls back to a full row** rather than
reaching for tracks that do not exist, which would grow implicit columns and skew the whole table.
So `column={3} span={2}` is a full row inside a narrow drawer, not half of one.

## What goes in the value

`children` is a `ReactNode`, so any component in the library drops straight in -- **no extra prop
required**. The only thing to watch is that anything taller than text stretches the row, which is
what `align` is for:

```tsx
// A single image or avatar: centring the label keeps it from sitting in the corner
<Descriptions bordered align="center">
  <DescriptionsItem label="ID photo">
    <Image src={idCard} alt="ID card front" width={120} height={76} />
  </DescriptionsItem>
  <DescriptionsItem label="Avatar"><Avatar src={user.avatar} /></DescriptionsItem>
</Descriptions>

// A strip of thumbnails: lay them out yourself, open ImageViewer on click (it is controlled --
// you own open/index)
<DescriptionsItem label="Site photos" span={2}>
  <div className="flex flex-wrap gap-2">
    {photos.map((p, i) => (
      <button key={p.src} type="button" onClick={() => setViewer({ open: true, index: i })}>
        <Image src={p.src} alt={p.alt} width={64} height={64} radius="sm" isZoomed />
      </button>
    ))}
  </div>
</DescriptionsItem>

// Status: use a Tag tone instead of painting your own colour
<DescriptionsItem label="Status"><Tag tone="danger">Expired</Tag></DescriptionsItem>

// An action next to the value (copy an order number, jump to a detail page)
<DescriptionsItem label="Order no.">
  <span className="inline-flex items-center gap-1">{order.no}<CopyButton value={order.no} /></span>
</DescriptionsItem>
```

Long text needs nothing special: the value cell is already `min-w-0`, so it wraps. Add `truncate`
yourself if you want one clipped line.

## Usage notes

- In bordered mode, spans should fill each row's `column` count or gaps remain. Let long fields occupy a complete row.
- `items` takes precedence when supplied together with `DescriptionsItem` children.
- Labels **do not wrap**: a wrapping label column changes width and height together, which drifts the alignment baseline for the whole table. Pin `labelWidth` when a label really is that long.
- `align="baseline"` cannot work under `bordered` (the label cell has to fill the row height or its background only hugs the text). The component warns in development and falls back to `start`. Drop `bordered` if you need baseline alignment.
- `emptyText` only replaces empty, not falsy: `0` still renders as `0`, deliberately -- "0 records" is a fact, not a missing value.

## Related
[Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md)
