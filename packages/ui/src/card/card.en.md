---
slug: card
name: Card
category: data-display
group: collection
tags: []
exports: [Card, CardHeader, CardBody, CardFooter]
status: enriched
---

# Card

> Card · Header, Body, and Footer slots · data-display/collection

## When to use

Use Card to group related content in a bordered or elevated container. Use [List](../list/list.md) for an item stream or grid, and [Descriptions](../descriptions/descriptions.md) for key-value details. Card is a structural shell with no business behavior.

## Import
```ts
import { Card, CardHeader, CardBody, CardFooter } from "@hulianui/ui"
```

## Props

`CardProps` inherits `HTMLAttributes<HTMLDivElement>` and adds a CVA variant:

| Name | Type | Default | Description |
|------|------|------|------|
| variant | `"outline" \| "elevated" \| "featured" \| "plain"` | `"outline"` | Border, raised shadow, emphasized, or no chrome at all. |
| divided | `boolean` | `true` | Whether a rule separates `CardHeader` / `CardFooter` from the body. Setting `false` removes both rules and tightens the padding they used to hold open. |

`CardBody` and `CardFooter` accept native div properties and `children`.

`CardHeaderProps` (also inherits `HTMLAttributes<HTMLDivElement>` except `title`, whose type is widened to ReactNode)

| Name | Type | Default | Description |
|------|------|------|------|
| title | `ReactNode` | — | The heading. It gets an element of its own (`data-slot="card-title"`) and therefore its own size, leading, and weight. |
| description | `ReactNode` | — | Supporting text below the heading, in the secondary text color. |
| extra | `ReactNode` | — | Trailing action area (buttons, switches, counts), vertically centered against the heading group and wrapping below it on narrow viewports. |

"Present" means the same thing it does for `PageHeader`'s `meta`: `null`, `undefined`, `false`, and `""` all count as not passed, so `title={isEditing && "Editing"}` does not switch layouts when the condition is false.

With **none** of the three passed, `CardHeader` stays the bare slot it is today: `children` is the content and the container carries `font-medium`. Passing any of them switches to a two-column heading / action layout, and `font-medium` moves off the container onto the title element — so icons, `Tag`s, and counts on the same row are no longer painted with heading weight. `children` remains the escape hatch and renders after the title and description, still in the left column.

`plain` is the no-chrome variant: no border, no background, no shadow — only the corner radius, the text color, and the three slot roles. Use it when **the container already gets its appearance from somewhere else**: a hero style the page brings along during a migration, an outer card that already draws a frame, or a card sitting inside a gradient section. The other three variants all paint a background (`bg-surface`), so they produce a doubled border and a doubled surface. The [Accordion](../accordion/accordion.md) and [Collapsible](../collapsible/collapsible.md) panels take a `plain` prop with the same meaning: **when the content brings its own appearance, the answer is no skin rather than a different skin**.

## Example
```tsx
<Card variant="elevated" className="w-64">
  <CardHeader>Hulian Card</CardHeader>
  <CardBody>Designed for beauty and practical use.</CardBody>
  <CardFooter>Footer</CardFooter>
</Card>
```

The "icon + heading + status tag + trailing action" row, the most common admin card header:
```tsx
<Card>
  <CardHeader
    title={<><Users className="size-5 text-muted-foreground" />Assign tasks<Tag>By role</Tag></>}
    description="Assign in bulk by role; changes take effect immediately."
    extra={<Button variant="ghost" size="sm">Expand</Button>}
  />
  <CardBody>…</CardBody>
</Card>
```

## Usage notes

- Do not wrap loading skeletons in Card. [[loading-skeletons-are-chromeless-dont-wrap-in-card]] explains why shimmer placeholders conventionally avoid borders and shadows.
- A fixed outer minimum height combined with flex stretching can push a final metadata row outside the card background; see [[grid-card-button-tail-row-leaks-outside-when-outer-min-height]].
- When the heading contains an icon or a `Tag`, pass `title` instead of packing the whole row into `children`: inside `children`, the header's `font-medium` paints the icon, the tag, and the count with heading weight, while the heading itself gets no size or leading of its own.
- `CardHeader`'s `title` is a `ReactNode` and collides with the native `HTMLAttributes.title?: string`, so the type omits `title`. Put a native tooltip on an inner element instead.
- `divided={false}` applies only to the **direct children** `CardHeader` and `CardFooter`, so a nested card does not inherit the outer value and must opt out itself. It is not delivered through context either: Card still has no `"use client"` and works inside a server component.

## Related
[Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md)
