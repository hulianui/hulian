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
| size | `"sm" \| "md" \| "lg" \| "xl" \| "2xl" \| "3xl" \| "full"` | `"xl"` | Maximum-width preset; see the table below. |
| padded | `boolean` | `true` | Adds horizontal safe padding only; it no longer also controls centering. |
| centered | `boolean` | `true` | Centers the container horizontally with `mx-auto`. |
| as | `ElementType` | `"div"` | Render tags (semantics/layout decoupling, such as section/main/article) |

All remaining `HTMLAttributes<HTMLElement>` attributes, including className and style, are supported.

## Slots

| Slot | Type | Description |
|------|------|------|
| children | `ReactNode` | sub content |

### Size mapping

| size | max-width | Typical use |
|------|-----------|-------------|
| sm | `max-w-2xl` | Reading content |
| md | `max-w-3xl` | Article pages |
| lg | `max-w-4xl` | Form pages |
| xl (default) | `max-w-5xl` | General content pages |
| 2xl | `max-w-6xl` | Marketing feature sections |
| 3xl | `max-w-7xl` | Footers or wide grids |
| full | No limit | Full-width sections |

`padded` and `centered` are independent switches: `padded` controls horizontal safe padding, while `centered` controls `mx-auto`. Previously, `padded={false}` also disabled centering, making custom padding on a centered container impossible (hulianui/hulian#58). Pass both as `false` to disable both behaviors.

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

### `as` is type-polymorphic

Properties and event types follow the element selected by `as`: `as="form"` gives `onSubmit` a `FormEvent<HTMLFormElement>`, while `as="a"` accepts `href`. Older typings reduced `event.currentTarget` to `HTMLElement`, forcing consumers to cast away the exact type safety that polymorphism should provide (hulianui/hulian#62).

## Related
[Layout](../layout/layout.md) · [AdminLayout](../admin-layout/admin-layout.md) · [ScrollArea](../scroll-area/scroll-area.md) · [Viewport](../viewport/viewport.md) · [Resizable](../resizable/resizable.md) · [AspectRatio](../aspect-ratio/aspect-ratio.md)
