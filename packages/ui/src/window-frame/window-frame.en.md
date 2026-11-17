---
slug: window-frame
name: WindowFrame
category: mockups
group: window
tags: []
exports: [WindowFrame]
status: enriched
---

# WindowFrame

> Wraps a piece of UI in an app window with a traffic-light title bar, like a product screenshot. · mockups/window

## When to use

For showing "one app window": product previews, AI chat windows, code demos. Traffic lights, a title, and an action slot on the right, with no address bar. For a browser shell (address bar, tabs) use [Safari](../safari/safari.md) / [Chrome](../chrome/chrome.md); to play back commands line by line use [Terminal](../terminal/terminal.md).

## Import
```ts
import { WindowFrame } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| title | `ReactNode` | - | Title slot to the right of the traffic lights. A string renders as small monospace text (like a file name or route); nodes such as a Tag work too |
| toolbar | `ReactNode` | - | Action slot at the right end of the title bar |

> Extends native `<div>` attributes (`className` lands on the frame, for width and height).

## Slots

| Slot | Type | Description |
|------|------|------|
| children | `ReactNode` | Window content; the content area has no padding |

## Examples
```tsx
<WindowFrame title="dashboard">
  <div className="h-[30rem] bg-bg">…</div>
</WindowFrame>

<WindowFrame title={<Tag tone="brand" size="sm">MCP</Tag>}>
  <div className="space-y-4 p-5">…conversation…</div>
</WindowFrame>
```

## Pitfalls

- The content area has no padding: screenshot-style content fills it, while chat or form content adds its own padding.
- The traffic lights use fixed macOS colors and don't follow the theme color (a device convention, same as Safari).

## Related
[Safari](../safari/safari.md) · [Chrome](../chrome/chrome.md) · [Terminal](../terminal/terminal.md)
