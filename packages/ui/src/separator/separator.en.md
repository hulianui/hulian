---
slug: separator
name: Separator
category: layout
group: arrange
tags: []
exports: [Separator]
status: enriched
---

# Separator

> Separator · Base UI role=separator + horizontal/vertical geometry · layout/arrange

## When to use

Use Separator for a purely geometric horizontal or vertical rule with ARIA `role="separator"`, such as structural grouping or menu and list boundaries. Use [Divider](../divider/divider.md) when the separator needs a label, dashed styling, or left/right label alignment.

## Import
```ts
import { Separator } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| orientation | `"horizontal" \| "vertical"` | `"horizontal"` | Horizontal renders an `h-px` rule; vertical renders `w-px` and requires parent height. |
| className | `string` | — | Additional class name. |

## Example
```tsx
// Horizontal separator
<p>Hulian Design System</p>
<Separator className="my-3" />
<p>Composable component library</p>

// Vertical separator; the parent supplies height
<div className="flex h-6 items-center gap-3">
  <span>Documentation</span>
  <Separator orientation="vertical" />
  <span>Components</span>
</div>
```

## Usage guidelines

A vertical Separator supplies only `w-px`; its height comes from the parent. Give the surrounding row a height such as `h-6`, or the separator can resolve to zero height and remain invisible.

## Related
[Stack](../stack/stack.md) · [Grid](../grid/grid.md) · [Spacer](../spacer/spacer.md) · [Divider](../divider/divider.md) · [Layout](../layout/layout.md) · [AdminLayout](../admin-layout/admin-layout.md)
