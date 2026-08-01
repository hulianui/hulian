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

> CSS Grid primitive · Fixed or responsive columns, configurable gaps, and spanning items · RSC-safe · layout/arrange

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
| cols | `number \| ResponsiveCols` | `1` | Column count. A number creates any fixed count through inline styles; `{ base, sm, md, lg }` uses static responsive classes. |
| rows | `number` | — | Explicit row count; omit it to let content create rows automatically. |
| gap | `number` | `0` | Row and column gap (× 0.25rem). |
| colGap | `number` | — | Column gap, overriding the column component of `gap` (× 0.25rem). |
| rowGap | `number` | — | Row gap, overriding the row component of `gap` (× 0.25rem). |
| inline | `boolean` | `false` | Uses `inline-grid` instead of `grid`. |
| as | `ElementType` | `"div"` | Element type rendered by Grid. |

### GridItem

| Name | Type | Default | Description |
|------|------|------|------|
| colSpan | `number` | — | Number of columns spanned. |
| rowSpan | `number` | — | Number of rows spanned. |
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

Pass a number to `cols` for an arbitrary fixed count. Pass `{ base, sm, md, lg }` when the count should change at the supported responsive breakpoints. Layout-specific issues involving page centering, card action rows, or collapsible tracks are outside this primitive's contract.

## Related
[Stack](../stack/stack.md) · [Spacer](../spacer/spacer.md) · [Divider](../divider/divider.md) · [Separator](../separator/separator.md) · [Layout](../layout/layout.md) · [AdminLayout](../admin-layout/admin-layout.md)
