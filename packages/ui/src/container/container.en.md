---
slug: container
name: Container
category: layout
group: container
tags: []
exports: [Container]
status: enriched
---

# Container

> Content container · Centered max-width presets, horizontal safe padding, polymorphic `as`, zero dependencies, and RSC support · layout/container

## When to use

Use Container to cap content width, center it horizontally, and preserve safe padding at both sides without repeating the site's `mx-auto max-w-Nxl px-6` pattern. Container controls width and centering only; use [Layout](../layout/layout.md) or Stack for child direction and spacing. For a complete application shell with sidebar, header, and tabs, use [AdminLayout](../admin-layout/admin-layout.md).

## Import
```ts
import { Container } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| size | `"sm" \| "md" \| "lg" \| "xl" \| "full"` | `"xl"` | Maximum width: sm=2xl / md=3xl / lg=4xl / xl=5xl / full=no limit |
| padded | `boolean` | `true` | Whether to center it horizontally and add left and right safety inner distances |
| as | `ElementType` | `"div"` | Render tags (semantics/layout decoupling, such as section/main/article) |

All remaining `HTMLAttributes<HTMLElement>` attributes, including className and style, are supported.

## Slots

| Slot | Type | Description |
|------|------|------|
| children | `ReactNode` | sub content |

## Examples
```tsx
// Constrain article width
<Container size="lg">
  <Box>Content is centered and limited to 4xl width.</Box>
</Container>

// Render a semantic element
<Container as="main" size="xl">
  {children}
</Container>
```

## Usage guidelines

`size` names map to HulianUI's Tailwind `max-w-*` presets rather than matching Tailwind names literally; for example, `sm` maps to `2xl`. Previously listed caveats for affix, dialog portals, dnd-kit, flex centering, Recharts, scrollspy, sticky glass, and Vant toast belong to those specific integrations, not to this generic width container.

## Related
[Layout](../layout/layout.md) · [AdminLayout](../admin-layout/admin-layout.md) · [ScrollArea](../scroll-area/scroll-area.md) · [Viewport](../viewport/viewport.md) · [Resizable](../resizable/resizable.md) · [AspectRatio](../aspect-ratio/aspect-ratio.md)
