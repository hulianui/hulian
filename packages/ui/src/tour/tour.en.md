---
slug: tour
name: Tour
category: feedback
group: guide
tags: []
exports: [Tour, resolveTarget, computeSpotlight, computeCardPosition, type Rect]
status: enriched
---

# Tour

> Guided tour · Dependency-free SVG mask spotlight and positioned explanation card with navigation, skip, progress, and resize/scroll recalculation · feedback/guide

## When to use

Use Tour to introduce a feature by highlighting a sequence of real DOM elements and explaining each step. Use [Tooltip](../tooltip/tooltip.md) or [Popover](../popover/popover.md) for one element, and [Dialog](../dialog/dialog.md) or [Modal](../modal/modal.md) for a blocking confirmation.

## Import
```ts
import { Tour, resolveTarget, computeSpotlight, computeCardPosition, type Rect } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| steps* | `TourStep[]` | — | Guided steps described below. |
| open* | `boolean` | — | Controlled open state. |
| current* | `number` | — | Controlled zero-based step index. |
| maskClosable | `boolean` | `false` | Whether clicking the mask closes the tour. |
| spotlightPadding | `number` | `8` | Space around the target cutout in pixels. |
| spotlightRadius | `number` | `8` | Cutout corner radius. |
| gap | `number` | `12` | Distance between the target and card. |
| zIndex | `number` | `100` | Mask z-index. |

**TourStep**:
| Field | Type | Default | Description |
|------|------|------|------|
| target | `(() => Element \| null) \| string \| null` | — | Target getter, CSS selector, or null for a centered card. Getters are most reliable for dynamic DOM. |
| title | `ReactNode` | — | Step title. |
| description | `ReactNode` | — | Step description. |
| placement | `"top" \| "bottom" \| "left" \| "right"` | `"bottom"` | Preferred side, flipped when necessary; ignored without a target. |

## Events

| Event | Type | Description |
|------|------|------|
| onChange | `(current: number) => void` | Reports Previous and Next navigation. |
| onClose | `() => void` | Called by Skip, Escape, or final completion when onFinish is absent. |
| onFinish | `() => void` | Optional final-step completion handler. |

## Slots

| Slot | Type | Description |
|------|------|------|
| prevText | `ReactNode` | Previous-button override. Defaults to the active `ConfigProvider` locale. |
| nextText | `ReactNode` | Next-button override. Defaults to the active `ConfigProvider` locale. |
| skipText | `ReactNode` | Skip-button override. Defaults to the active `ConfigProvider` locale. |
| finishText | `ReactNode` | Finish-button override. Defaults to the active `ConfigProvider` locale. |

> TourStep `title` and `description` are also ReactNode values, as shown above.

## Example
```tsx
const [open, setOpen] = useState(false);
const [current, setCurrent] = useState(0);

<Tour
  open={open}
  current={current}
  onChange={setCurrent}
  onClose={() => setOpen(false)}
  steps={[
    { title: "Welcome", description: "Centered introduction" },
    { target: () => searchRef.current, title: "Global search", description: "Search across the app", placement: "bottom" },
    { target: "#new-btn", title: "Create an item", description: "Start here", placement: "left" },
  ]}
/>
```

## Usage guidelines

- Tour is fully controlled. Store both `open` and `current`; navigation only calls `onChange`. Failing to write current back leaves the tour on the same step.
- Prefer a target getter over a selector when the target mounts dynamically.
- The fullscreen overlay portals to body. For visual verification, open the tour before capturing the screenshot.
- Navigation, close, dialog, and progress labels follow the nearest `ConfigProvider` locale (`zhCN` by default, or `enUS`). Explicit text props take precedence.

## Related
[Dialog](../dialog/dialog.md) · [Modal](../modal/modal.md) · [AlertDialog](../alert-dialog/alert-dialog.md) · [Drawer](../drawer/drawer.md) · [Popover](../popover/popover.md) · [Tooltip](../tooltip/tooltip.md)
