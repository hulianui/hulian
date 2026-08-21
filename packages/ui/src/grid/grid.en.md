---
slug: grid
name: Grid
category: layout
group: arrange
tags: []
exports: [Grid, GridItem]
status: enriched
---

# Grid

> Defines type-safe polymorphic grid columns through the 2xl breakpoint with gaps and child row or column spans. · layout/arrange

## When to use

Use Grid for two-dimensional layouts such as fixed-column forms, card collections, or arrangements with items that span rows and columns. Use GridItem to set `colSpan` and `rowSpan`. Choose [Stack](../stack/stack.md) for a single row or column, or [Spacer](../spacer/spacer.md) when only directional whitespace is needed.

## Import
```ts
import { Grid, GridItem } from "@hulianui/ui"
```

## Props

### Grid

| Name | Type | Default | Description |
|------|------|------|------|
| cols | `number \| ResponsiveCols` | `1` | Column count. A number creates any fixed count through inline styles; `{ base, sm, md, lg, xl, 2xl }` uses static responsive classes. |
| rows | `number` | - | Explicit row count; omit it to let content create rows automatically. |
| gap | `number` | `0` | Row and column gap (× 0.25rem). |
| colGap | `number` | - | Column gap, overriding the column component of `gap` (× 0.25rem). |
| rowGap | `number` | - | Row gap, overriding the row component of `gap` (× 0.25rem). |
| inline | `boolean` | `false` | Uses `inline-grid` instead of `grid`. |
| as | `ElementType` | `"div"` | Element type rendered by Grid. |

### GridItem

| Name | Type | Default | Description |
|------|------|------|------|
| colSpan | `number` | - | Number of columns spanned. |
| rowSpan | `number` | - | Number of rows spanned. |
| as | `ElementType` | `"div"` | Element type rendered by GridItem. |

Both components forward the remaining `HTMLAttributes<HTMLElement>` to their rendered element.

## Slots

### Grid

| Slot | Type | Description |
|------|------|------|
| children | `ReactNode` | Grid contents. |

### GridItem

| Slot | Type | Description |
|------|------|------|
| children | `ReactNode` | Content of the grid item. |

Responsive values cover every Tailwind breakpoint: `base / sm / md / lg / xl / 2xl`. Wide admin layouts often need to change columns at `xl` (1280 px and above); stopping at `lg` forced consumers to split one layout between props and `className` (hulianui/hulian#61). For example: `cols={{ base: 1, xl: 4, "2xl": 6 }}`.

## Examples
```tsx
// Three equal-width columns
<Grid cols={3} gap={3} className="w-72">
  {["1", "2", "3", "4", "5", "6"].map((n) => <Box key={n}>{n}</Box>)}
</Grid>

// Span multiple columns
<Grid cols={3} gap={3}>
  <GridItem colSpan={2}><Box>Spans two columns</Box></GridItem>
  <Box>3</Box>
</Grid>
```

## Usage guidelines

Pass a number to `cols` for an arbitrary fixed count. Pass `{ base, sm, md, lg, xl, 2xl }` when the count should change at responsive breakpoints. Layout-specific issues involving page centering, card action rows, or collapsible tracks are outside this primitive's contract.

### `as` is type-polymorphic

Properties and event types follow the element selected by `as`: `as="form"` gives `onSubmit` a `FormEvent<HTMLFormElement>`, while `as="a"` accepts `href`. Older typings reduced `event.currentTarget` to `HTMLElement`, forcing consumers to cast away the exact type safety that polymorphism should provide (hulianui/hulian#62).

## Related
[Stack](../stack/stack.md) · [Spacer](../spacer/spacer.md) · [Divider](../divider/divider.md) · [Separator](../separator/separator.md) · [Layout](../layout/layout.md) · [AdminLayout](../admin-layout/admin-layout.md)
