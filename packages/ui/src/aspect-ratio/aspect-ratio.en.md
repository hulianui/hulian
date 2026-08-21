---
slug: aspect-ratio
name: AspectRatio
category: layout
group: container
tags: []
exports: [AspectRatio]
status: enriched
---

# AspectRatio

> Keeps media or content inside a fixed width-to-height ratio. · layout/container

## When to use

Use AspectRatio to keep an image, video, or card at a fixed ratio such as 16:9, 1:1, or 4:3. Its height follows the available width without layout shift. The component only constrains the ratio using CSS and can render as an RSC. Use [Viewport](../viewport/viewport.md) when the layout itself must respond to container width, or [FitScreen](../fit-screen/fit-screen.md) when a fixed-size design must be scaled proportionally to fill the available area.

## Import
```ts
import { AspectRatio } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| ratio | `number` | `1` | Width divided by height, such as `16/9`, `1`, or `4/3`. |

Inherits `HTMLAttributes<HTMLDivElement>`.

## Slots

| Slot | Type | Description |
|------|------|------|
| children | `ReactNode` | Child content, usually an image or video, that automatically fills the container. |

## Examples
```tsx
// 16:9 media container: the parent sets the width and height follows automatically
<div className="w-64">
  <AspectRatio ratio={16 / 9}>
    <img src="..." alt="..." />
  </AspectRatio>
</div>
```

```tsx
// 1:1 avatar/thumbnail
<div className="w-40">
  <AspectRatio ratio={1}>
    <Fill label="1 / 1" />
  </AspectRatio>
</div>
```

## Usage guidelines

- **`ratio` is a number, not a string.** Pass an expression such as `16 / 9` or a numeric value such as `1.7778`; do not pass `"16/9"`.
- **The parent determines the width.** AspectRatio fills the available width and derives its height from `ratio`. If the parent does not constrain the width, the component expands to the full available width. Child elements do not need their own `w-full h-full`; the component already stretches them to fill the container.

## Related
[Layout](../layout/layout.md) · [AdminLayout](../admin-layout/admin-layout.md) · [ScrollArea](../scroll-area/scroll-area.md) · [Viewport](../viewport/viewport.md) · [Resizable](../resizable/resizable.md) · [FitScreen](../fit-screen/fit-screen.md)
