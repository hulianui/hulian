---
slug: stack
name: Stack
category: layout
group: arrange
tags: []
exports: [Stack]
status: enriched
---

# Stack

> Flex layout primitive · direction, gap, align, justify, wrap + polymorphic `as` · dependency-free · RSC-safe · layout/arrange

## When to use

Use Stack to arrange children along one horizontal or vertical axis with consistent spacing, alignment, and optional wrapping. Use [Grid](../grid/grid.md) for two-dimensional row-and-column placement, or [Spacer](../spacer/spacer.md) for one fixed gap between two elements.

## Import
```ts
import { Stack } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| direction | `StackDirection \| ResponsiveDirection` | `"column"` | Main-axis direction. A string is fixed; `{base,sm,md,lg}` responds by breakpoint. |
| gap | `number` | `0` | Child spacing (× 0.25rem, same as Tailwind spacing scale) |
| align | `"start" \| "center" \| "end" \| "stretch" \| "baseline"` | — | Cross-axis alignment. |
| justify | `"start" \| "center" \| "end" \| "between" \| "around" \| "evenly"` | — | Main-axis distribution. |
| wrap | `boolean` | `false` | Whether to wrap (only row is meaningful) |
| inline | `boolean` | `false` | Use inline-flex instead of flex (shrinks with content and can be aligned with the text baseline) |
| as | `ElementType` | `"div"` | Rendered element tag |

`StackDirection = "row" \| "column"`; the remaining `HTMLAttributes<HTMLElement>` attributes (className/style/event, etc.) are transparently transmitted.

## Slots

| Slot | Type | Description |
|------|------|------|
| children | `ReactNode` | child element |

## Example
```tsx
// Horizontal row with spacing scale 3
<Stack direction="row" gap={3}>
  <Box>A</Box>
  <Box>B</Box>
  <Box>C</Box>
</Stack>

// Justify
<Stack direction="row" justify="between" className="w-64">
  <Box>Left</Box>
  <Box>Right</Box>
</Stack>
```

## Usage guidelines

`gap` uses Tailwind spacing multiples rather than pixels, so `gap={3}` equals 0.75rem. `wrap` and `justify` are most useful with `direction="row"`; use Grid when wrapping rows also need column alignment.

## Related
[Grid](../grid/grid.md) · [Spacer](../spacer/spacer.md) · [Divider](../divider/divider.md) · [Separator](../separator/separator.md) · [Layout](../layout/layout.md) · [AdminLayout](../admin-layout/admin-layout.md)
