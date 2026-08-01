---
slug: viewport
name: Viewport
category: layout
group: container
tags: []
exports: [Viewport]
status: enriched
---

# Viewport

> Responsive preview container · container-query context + web/tablet/phone widths + optional Segmented device switcher + `@md`/`@5xl` variants based on container width · layout/container

## When to use

Use Viewport when one layout should rearrange from its **container width**, independently of the browser viewport. Children use container variants such as `@md:` and `@5xl:`, while the optional controls preview web, tablet, and phone widths. Use [AspectRatio](../aspect-ratio/aspect-ratio.md) to lock one element's ratio, or [FitScreen](../fit-screen/fit-screen.md) to scale a fixed design proportionally.

## Import
```ts
import { Viewport } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| device | `"web" \| "tablet" \| "phone"` | — | Controlled preset: responsive web width, 768 px tablet, or 390 px phone. |
| defaultDevice | `"web" \| "tablet" \| "phone"` | `"web"` | Initial device preset when uncontrolled. |
| controls | `boolean` | `false` | The top shows the device switcher (dogfood Segmented). |
| width | `number \| string` | — | Custom width, overrides device default (number=px or any CSS length). |
| name | `string` | — | Named container, used for `@md/name:` named container query; default anonymous container (use `@md:`). |
| framed | `boolean` | `true` | Tablet/phone adds device-like borders; web has constant thin borders. |
| height | `number \| string` | With content | Fixed container height (number=px or CSS). |
| className | `string` | — | The root container class name. |

## Events

| Event | Type | Description |
|------|------|------|
| onDeviceChange | `(device: "web" \| "tablet" \| "phone") => void` | Device change callback. |

## Slots

| Slot | Type | Description |
|------|------|------|
| children* | `ReactNode` | Container content, internally use container variants such as `@md:`/`@5xl:` to adapt according to the width of the container. |

## Example
```tsx
// Switch device widths to preview container-driven rearrangement
<Viewport controls defaultDevice="phone">
  {/* Container variants respond to this container's width. */}
  <div className="grid grid-cols-1 @md:grid-cols-2 @5xl:grid-cols-3">…</div>
</Viewport>
```

```tsx
// Custom width, no device borders
<Viewport width={600} framed={false}>
  <ResponsiveDemo />
</Viewport>
```

## Usage guidelines

- **Container variants are not viewport breakpoints.** Children must use `@md:`/`@5xl:`, not Tailwind's `md:`/`5xl:`. The latter responds to the browser window and ignores Viewport width.
- When several containers coexist, assign `name` and target `@md/name:` so nested queries do not accidentally bind to the nearest unnamed ancestor.

## Related
[Layout](../layout/layout.md) · [AdminLayout](../admin-layout/admin-layout.md) · [ScrollArea](../scroll-area/scroll-area.md) · [Resizable](../resizable/resizable.md) · [AspectRatio](../aspect-ratio/aspect-ratio.md) · [FitScreen](../fit-screen/fit-screen.md)
