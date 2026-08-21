---
slug: divider
name: Divider
category: layout
group: arrange
tags: []
exports: [Divider]
status: enriched
---

# Divider

> Separates content with optional text, alignment, dashed styling, or vertical orientation. · layout/arrange

## When to use

Use Divider when a separator needs an embedded label such as "Latest updates" or "More," a dashed style, or an inline vertical line. Use [Separator](../separator/separator.md) for an unlabeled geometric boundary with ARIA `role="separator"`; Divider is content-oriented, while Separator provides structural semantics.

## Import
```ts
import { Divider } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| type | `"horizontal" \| "vertical"` | `"horizontal"` | direction. vertical is an inline separation (embedded between a line of text/elements) |
| orientation | `"left" \| "center" \| "right"` | `"center"` | Horizontal position of embedded text (only effective when horizontal + text is present) |
| dashed | `boolean` | `false` | dotted line |
| plain | `boolean` | `false` | Regular font weight for text (one bold step by default) |
| className | `string` | - | Extra class name |

## Slots

| Slot | Type | Description |
|------|------|------|
| children | `ReactNode` | Text embedded in the separator; if not passed, it will be a pure separator |

## Examples
```tsx
// Unlabeled divider
<p> Previous paragraph</p>
<Divider />
<p>Next paragraph</p>

// Left-aligned label
<Divider orientation="left"> latest update </Divider>

// Inline vertical divider
<div className="flex items-center">
<span>Document</span>
  <Divider type="vertical" />
<span> components</span>
</div>
```

## Usage guidelines

`orientation` affects label placement only when `type="horizontal"` has children. A `type="vertical"` divider is an inline line whose height follows the parent line; place it inside a flex row.

## Related
[Stack](../stack/stack.md) · [Grid](../grid/grid.md) · [Spacer](../spacer/spacer.md) · [Separator](../separator/separator.md) · [Layout](../layout/layout.md) · [AdminLayout](../admin-layout/admin-layout.md)
