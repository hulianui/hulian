---
slug: spacer
name: Spacer
category: layout
group: arrange
tags: []
exports: [Spacer]
status: enriched
---

# Spacer

> Directional spacing primitive · `x`/`y` × 0.25rem + `aria-hidden` + RSC-safe · layout/arrange

## When to use

Use Spacer to insert fixed horizontal or vertical whitespace between two adjacent elements. It is `aria-hidden` and does not enter the accessibility tree. Prefer the `gap` prop on [Stack](../stack/stack.md) or [Grid](../grid/grid.md) for consistent spacing across a whole group. Use [Divider](../divider/divider.md) or [Separator](../separator/separator.md) when the boundary should be visible.

## Import
```ts
import { Spacer } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| x | `number` | `1` | Horizontal spacing (× 0.25rem, same as Tailwind spacing scale) |
| y | `number` | — | Vertical spacing (× 0.25rem) |
| className | `string` | — | Extra class name |

## Example
```tsx
// Horizontal space
<span className="inline-flex items-center">
  <Box>A</Box>
  <Spacer x={8} />
  <Box>B</Box>
</span>

// Vertical space
<span className="inline-flex flex-col">
  <Box>Above</Box>
  <Spacer y={6} />
  <Box>Below</Box>
</span>
```

## Usage guidelines

`x` and `y` use Tailwind spacing multiples, so `x={8}` equals 2rem. Use `x` along a flex row and `y` along a flex column; a Spacer whose dimension does not match the parent's main axis may not create the intended gap.

## Related
[Stack](../stack/stack.md) · [Grid](../grid/grid.md) · [Divider](../divider/divider.md) · [Separator](../separator/separator.md) · [Layout](../layout/layout.md) · [AdminLayout](../admin-layout/admin-layout.md)
