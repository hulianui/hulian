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

> Groups related content into header, body, and footer regions. · data-display/collection

## When to use

Use Card to group related content in a bordered or elevated container. Use [List](../list/list.md) for an item stream or grid, and [Descriptions](../descriptions/descriptions.md) for key-value details. Card is a structural shell with no business behavior.

## Import
```ts
import { Card, CardHeader, CardBody, CardFooter, Text } from "@hulianui/ui"
```

## Props

`CardProps` inherits `HTMLAttributes<HTMLDivElement>` and adds a CVA variant:

| Name | Type | Default | Description |
|------|------|------|------|
| variant | `"outline" \| "elevated" \| "featured" \| "plain"` | `"outline"` | Border, raised shadow, emphasized, or no chrome at all. |
| size | `"sm" \| "md"` | `"md"` | Whole-card density. `sm` tightens the Header, Body, and Footer padding together. |
| divided | `boolean` | `true` | Whether a rule separates `CardHeader` / `CardFooter` from the body. Setting `false` removes both rules and tightens the padding they used to hold open. |

`CardBody` and `CardFooter` accept native div properties and `children`. `CardBody` no longer assigns a font size: its content owns typography, whether you use plain text or an explicit `Text size`.

`CardHeaderProps` (also inherits `HTMLAttributes<HTMLDivElement>` except `title`, whose type is widened to ReactNode)

| Name | Type | Default | Description |
|------|------|------|------|
| title | `ReactNode` | - | The heading. It gets an element of its own (`data-slot="card-title"`) and therefore its own size, leading, and weight. |
| description | `ReactNode` | - | Supporting text below the heading, in the secondary text color. |
| extra | `ReactNode` | - | Trailing action area (buttons, switches, counts), vertically centered against the heading group and **always on the same line**: wrapping is decided independently of content length, so a long `description` never pushes it to a second row. |

"Present" means the same thing it does for `PageHeader`'s `meta`: `null`, `undefined`, `false`, and `""` all count as not passed, so `title={isEditing && "Editing"}` does not switch layouts when the condition is false.

With **none** of the three passed, `CardHeader` stays the bare slot it is today: `children` is the content and the container carries `font-medium`. Passing any of them switches to a two-column heading / action layout, and `font-medium` moves off the container onto the title element, so icons, `Tag`s, and counts on the same row are no longer painted with heading weight. `children` remains the escape hatch and renders after the title and description, still in the left column.

`plain` is the no-chrome variant: no border, no background, no shadow, just the corner radius, the text color, and the three slot roles. Use it when **the container already gets its appearance from somewhere else**: a hero style the page brings along during a migration, an outer card that already draws a frame, or a card sitting inside a gradient section. The other three variants all paint a background (`bg-surface`), so they produce a doubled border and a doubled surface. The [Accordion](../accordion/accordion.md) and [Collapsible](../collapsible/collapsible.md) panels take a `plain` prop with the same meaning: **when the content brings its own appearance, the answer is no skin rather than a different skin**.

## Example
```tsx
<Card variant="elevated" className="w-64">
  <CardHeader>Hulian Card</CardHeader>
  <CardBody>Designed for beauty and practical use.</CardBody>
<CardFooter>Footer</CardFooter>
</Card>
```

`md` is the default density. Use `sm` for denser information; all three regions tighten together while the body typography remains owned by its content:
```tsx
<Card size="sm">
  <CardHeader title="Runtime metrics" />
  <CardBody>
    <Text size="lg">98.7%</Text>
  </CardBody>
  <CardFooter>Last 5 minutes</CardFooter>
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

- **The `Card` root carries no padding of its own; content must go inside `CardBody`.** The
  root only sets the radius, the text color, and the density variables (`[--card-body-px:1.25rem]`
  and friends); the three sections `CardHeader` / `CardBody` / `CardFooter` are what actually
  consume those variables. So `<Card><div>content</div></Card>` has **zero padding** and sits
  flush against the border. That is by design, not a bug. Note also that this library calls it
  **`CardBody`, not `CardContent`** (shadcn/ui uses the latter, so muscle memory misfires here;
  when it errors, reach for the right name rather than falling back to a bare `div`).
- **If padding is gone card-wide, even with `CardBody` in place, suspect a missing `@source`
  in the consumer first** (#336). Those density variables and `px-[var(--card-body-px,1.25rem)]`
  are the only family in the library that writes spacing as an arbitrary value, and such
  literals exist nowhere but Hulian's own source. Ordinary classes like `px-4`, `gap-2` and
  `rounded-xl` appear in consumer code too, so Tailwind emits them regardless. The result is
  that a missing `@source` does not look like "no styles at all" but like "**borders, radii and
  colors are all correct, yet every container lost its padding**" - which reads as a component
  bug. The test: `grep card-body-px` in the built CSS; no match means `@source` is missing (see
  [consuming.md §8](https://github.com/hulianui/hulian/blob/master/docs/consuming.md)). Since `@hulianui/tokens` 0.12.0 the
  preset ships a safelist that covers this family.
- Do not wrap loading skeletons in Card. [[loading-skeletons-are-chromeless-dont-wrap-in-card]] explains why shimmer placeholders conventionally avoid borders and shadows.
- A fixed outer minimum height combined with flex stretching can push a final metadata row outside the card background; see [[grid-card-button-tail-row-leaks-outside-when-outer-min-height]].
- When the heading contains an icon or a `Tag`, pass `title` instead of packing the whole row into `children`: inside `children`, the header's `font-medium` paints the icon, the tag, and the count with heading weight, while the heading itself gets no size or leading of its own.
- `CardHeader`'s `title` is a `ReactNode` and collides with the native `HTMLAttributes.title?: string`, so the type omits `title`. Put a native tooltip on an inner element instead.
- `extra` **never drops to a second row because `title` or `description` grew** (#263). The left column is `flex: 1 1 0`, so wrapping is decoupled from content length and long text truncates or clamps as written. **The flip side is that `extra` keeps its slot even in a narrow card**, squeezing the heading -- so give the heading an overflow treatment. Card width comes from the layout (a three-column grid, a sidebar) and has nothing to do with the viewport, which is why there is deliberately no "wrap on narrow screens" step here. [PageHeader](../page-header/page-header.md) has one, because a page header is always full width and a narrow viewport does mean a narrow header.
- `divided={false}` applies only to the **direct children** `CardHeader` and `CardFooter`, so a nested card does not inherit the outer value and must opt out itself. It is not delivered through context either: Card still has no `"use client"` and works inside a server component.
- `size="sm"` is supplied by density variables on the Card root. A nested Card resets its own default `md` values and must explicitly receive `size="sm"` when it should be compact. Section `className` values such as `p-0` and `pt-0` still override the corresponding padding as before.

## Related
[Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md)
