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

> Grid layout · grid primitive cols/gap + GridItem across columns and rows (zero dependency·RSC) · layout/arrange

## When to use

Use Grid for two-dimensional layouts with fixed columns, card grids, or items spanning rows and columns. GridItem controls `colSpan` and `rowSpan`. Use [Stack](../stack/stack.md) for a single row or column, or [Spacer](../spacer/spacer.md) for directional empty space.

## Import
```ts
import { Grid, GridItem } from "@hulianui/ui"
```

## Props

### Grid

| Name | Type | Default | Description |
|------|------|------|------|
| cols | `number \| ResponsiveCols` | `1` | Number of columns. Number = fixed number of columns (any value, inline style); `{base,sm,md,lg}` = responsive (static class) |
| rows | `number` | — | Explicit row count; omit it to let content create rows automatically. |
| gap | `number` | `0` | Row and column gap (× 0.25rem). |
| colGap | `number` | — | Column spacing, covering gap (× 0.25rem) |
| rowGap | `number` | — | Line spacing, covering gap (× 0.25rem) |
| inline | `boolean` | `false` | Use inline-grid instead of grid |
| as | `ElementType` | `"div"` | Rendered element tag |

### GridItem

| Name | Type | Default | Description |
|------|------|------|------|
| colSpan | `number` | — | Number of columns spanned |
| rowSpan | `number` | — | Number of rows spanned. |
| as | `ElementType` | `"div"` | Rendered element tag |

Both the remaining `HTMLAttributes<HTMLElement>` properties support.

## Slots

### Grid

| Slot | Type | Description |
|------|------|------|
| children | `ReactNode` | child element |

### GridItem

| Slot | Type | Description |
|------|------|------|
| children | `ReactNode` | child element |

## Examples
```tsx
// Three equal-width columns
<Grid cols={3} gap={3} className="w-72">
  {["1", "2", "3", "4", "5", "6"].map((n) => <Box key={n}>{n}</Box>)}
</Grid>

// Span multiple columns
<Grid cols={3} gap={3}>
<GridItem colSpan={2}><Box> across 2 columns </Box></GridItem>
  <Box>3</Box>
</Grid>
```

## Usage guidelines

Pass a number to `cols` for any column count through inline styles, or pass `{base,sm,md,lg}` to use static responsive classes. Previously listed caveats for body centering, card-button rows, and nested collapsible grid rows belong to those specific layouts, not to this general primitive.

## Related
[Stack](../stack/stack.md) · [Spacer](../spacer/spacer.md) · [Divider](../divider/divider.md) · [Separator](../separator/separator.md) · [Layout](../layout/layout.md) · [AdminLayout](../admin-layout/admin-layout.md)
