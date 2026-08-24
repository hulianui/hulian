---
slug: stack
name: Stack
category: layout
group: arrange
tags: []
exports: [Stack, StackItem]
status: enriched
---

# Stack

> Arranges type-safe polymorphic flex content with gap, alignment, wrapping, and responsive direction through 2xl. · layout/arrange

## When to use

Use Stack to arrange children along one horizontal or vertical axis with consistent spacing, alignment, and optional wrapping. Use [Grid](../grid/grid.md) for two-dimensional row-and-column placement, or [Spacer](../spacer/spacer.md) for one fixed gap between two elements.

## Import
```ts
import { Stack, StackItem } from "@hulianui/ui"
```

## Props

### Stack

| Name | Type | Default | Description |
|------|------|------|------|
| direction | `StackDirection \| ResponsiveDirection` | `"column"` | Main-axis direction. A string is fixed; `{base,sm,md,lg,xl,2xl}` responds by breakpoint. |
| gap | `number` | `0` | Child spacing (× 0.25rem, same as Tailwind spacing scale) |
| align | `"start" \| "center" \| "end" \| "stretch" \| "baseline"` | - | Cross-axis alignment. |
| justify | `"start" \| "center" \| "end" \| "between" \| "around" \| "evenly"` | - | Main-axis distribution. |
| wrap | `boolean` | `false` | Whether to wrap (only row is meaningful) |
| inline | `boolean` | `false` | Use inline-flex instead of flex (shrinks with content and can be aligned with the text baseline) |
| as | `ElementType` | `"div"` | Rendered element tag |

`StackDirection = "row" \| "column"`; the remaining `HTMLAttributes<HTMLElement>` attributes (className/style/event, etc.) are transparently transmitted.

### StackItem

`StackItem` is the flex-child primitive for Stack. Use its fixed utility classes to control main-axis sizing. It renders a `div` by default and supports the same polymorphic `as` prop and attribute forwarding as Stack.

| Name | Type | Default | Description |
|------|------|------|------|
| grow | `boolean` | `false` | `true` adds `flex-1` and takes the remaining main-axis space |
| shrink | `boolean` | `undefined` | `false` adds `shrink-0`; `true`/unset keeps the browser default |
| minWidth | `0` | `undefined` | `0` adds `min-w-0`, allowing flex-child content to shrink |
| as | `ElementType` | `"div"` | Rendered element tag |

`StackItem` also forwards `children`, `className`, and other HTML attributes for the selected element.

## Slots

| Slot | Type | Description |
|------|------|------|
| children | `ReactNode` | child element |

Responsive values cover every Tailwind breakpoint: `base / sm / md / lg / xl / 2xl`. Wide admin layouts often need to change direction at `xl` (1280 px and above); stopping at `lg` forced consumers to split one layout between props and `className` (hulianui/hulian#61). For example: `direction={{ base: "column", xl: "row" }}`.

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

// Let a long title shrink while reserving room for a right-side action
<Stack direction="row" align="center" gap={3}>
  <StackItem grow minWidth={0}>
    <Text truncate>A long title that leaves room for the action on the right</Text>
  </StackItem>
  <StackItem shrink={false}>
    <Button>Action</Button>
  </StackItem>
</Stack>
```

## Usage guidelines

`gap` uses Tailwind spacing multiples rather than pixels, so `gap={3}` equals 0.75rem. `wrap` and `justify` are most useful with `direction="row"`; use Grid when wrapping rows also need column alignment.

### `as` is type-polymorphic

Properties and event types follow the element selected by `as`: `as="form"` gives `onSubmit` a `FormEvent<HTMLFormElement>`, while `as="a"` accepts `href`. Older typings reduced `event.currentTarget` to `HTMLElement`, forcing consumers to cast away the exact type safety that polymorphism should provide (hulianui/hulian#62).

## Related
[Grid](../grid/grid.md) · [Spacer](../spacer/spacer.md) · [Divider](../divider/divider.md) · [Separator](../separator/separator.md) · [Layout](../layout/layout.md) · [AdminLayout](../admin-layout/admin-layout.md)
