---
slug: resizable
name: Resizable
category: layout
group: container
tags: []
exports: [ResizablePanelGroup, ResizablePanel, ResizableHandle, applyResize, splitEqually]
status: enriched
---

# Resizable

> Builds keyboard-accessible horizontal or vertical split panes with size constraints. · layout/container

## When to use

Use Resizable when users need to drag a handle to resize adjacent panels, such as an IDE with three columns or a chat list beside its detail view. Use [Viewport](../viewport/viewport.md) when layout should rearrange automatically from container width, or [Layout](../layout/layout.md) for a fixed page skeleton.

## Import
```ts
import { ResizablePanelGroup, ResizablePanel, ResizableHandle, applyResize, splitEqually } from "@hulianui/ui"
```

## Props

### ResizablePanelGroup
| Name | Type | Default | Description |
|------|------|------|------|
| direction | `"horizontal" \| "vertical"` | `"horizontal"` | `horizontal` places panels side by side with vertical separators; `vertical` stacks panels with horizontal separators. |
| sizes | `number[]` | - | Controlled percentage sizes, one per panel. Pair with `onSizesChange`. |
| defaultSizes | `number[]` | Equal shares | Initial uncontrolled sizes; defaults to an even split across panels. |

Inherited from `HTMLAttributes<HTMLDivElement>` (except onChange).

### ResizablePanel
| Name | Type | Default | Description |
|------|------|------|------|
| min | `number` | `10` | Minimum size as a percentage. |
| max | `number` | `100` | Maximum size as a percentage. |

Inherited from `HTMLAttributes<HTMLDivElement>`.

### ResizableHandle
| Name | Type | Default | Description |
|------|------|------|------|
| keyboardStep | `number` | `5` | Percentage adjusted per arrow-key press on the focusable `role="separator"`. |

Inherited from `HTMLAttributes<HTMLDivElement>` (except aria-orientation).

### Helper functions
- `splitEqually(n)`: returns an array of equal percentage sizes for `n` panels.
- `applyResize(...)`: calculates a new size array from a drag delta, including min/max clamping.

## Events

### ResizablePanelGroup
| Event | Type | Description |
|------|------|------|
| onSizesChange | `(sizes: number[]) => void` | Size change callback. |

## Slots

### ResizablePanelGroup
| Slot | Type | Description |
|------|------|------|
| children* | `ReactNode` | Panels and Handles are arranged alternately. |

## Example
```tsx
// Three horizontal panels: file tree, editor, and preview
<ResizablePanelGroup direction="horizontal" defaultSizes={[24, 46, 30]}>
  <ResizablePanel min={15}><FileTree /></ResizablePanel>
  <ResizableHandle />
  <ResizablePanel min={25}><Editor /></ResizablePanel>
  <ResizableHandle />
  <ResizablePanel min={18}><Preview /></ResizablePanel>
</ResizablePanelGroup>
```

```tsx
// Two vertical panels
<ResizablePanelGroup direction="vertical" defaultSizes={[55, 45]}>
  <ResizablePanel min={20}><ChatLog /></ResizablePanel>
  <ResizableHandle />
  <ResizablePanel min={20}><LogPanel /></ResizablePanel>
</ResizablePanelGroup>
```

## Usage guidelines

- **Alternate Panel and Handle children.** Place exactly one `ResizableHandle` between adjacent `ResizablePanel` elements. Missing or extra handles make neighbor-based size redistribution target the wrong elements.
- **The size-array length must equal the panel count.** `sizes` and `defaultSizes` contain one percentage per panel. Use `splitEqually(n)` for initialization and `applyResize` when calculating controlled updates manually.
- In controlled mode, write the new `sizes` back from `onSizesChange`; otherwise dragging cannot update the layout.

## Related
[Layout](../layout/layout.md) · [AdminLayout](../admin-layout/admin-layout.md) · [ScrollArea](../scroll-area/scroll-area.md) · [Viewport](../viewport/viewport.md) · [AspectRatio](../aspect-ratio/aspect-ratio.md) · [FitScreen](../fit-screen/fit-screen.md)
