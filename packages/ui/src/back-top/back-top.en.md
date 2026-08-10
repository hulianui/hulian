---
slug: back-top
name: BackTop
category: navigation
group: inpage
tags: []
exports: [BackTop]
status: enriched
---

# BackTop

> Back to top · Appears after a scroll threshold, scrolls smoothly, and falls back to instant scrolling under reduced motion · navigation/inpage

## When to use

Use BackTop to reveal a floating button after a long page has scrolled beyond a threshold and return to the top when selected. Use [Affix](../affix/affix.md) to pin arbitrary content, or [Anchor](../anchor/anchor.md) for navigation among page sections.

## Import
```ts
import { BackTop } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| target | `() => HTMLElement \| Window \| null` | `window` | Container to observe and scroll to the top. |
| visibilityHeight | `number` | `400` | Scroll distance in pixels before the button fades in. |
| className | `string` | — | The default uses `fixed` at the viewport's lower-right corner; override with `absolute` for a local container. |
| aria-label | `string` | Follows `ConfigProvider` | Accessible name for the back-to-top action; falls back to the current locale's default wording. |

## Events

| Event | Type | Description |
|------|------|------|
| onClick | `() => void` | Called after the click initiates scrolling. |

## Slots

| Slot | Type | Description |
|------|------|------|
| children | `ReactNode` | Custom floating-button content. Defaults to an upward arrow whose built-in Chinese `aria-label` is `"\u56de\u5230\u9876\u90e8"`, meaning “Back to top.” |

## Example
```tsx
// Observe window and appear after 400px
<BackTop visibilityHeight={400} />

// Stay inside a local scroll frame
const ref = useRef<HTMLDivElement>(null);
<div className="relative">
  <div ref={ref} className="h-44 overflow-y-auto">{/* Content */}</div>
  <BackTop target={() => ref.current} visibilityHeight={80} className="absolute bottom-3 right-3" />
</div>
```

## Usage guidelines

- The default fixed positioning targets the full viewport. Inside a local scroller, both pass that element through `target` and override positioning with `className="absolute ..."`; otherwise the button sits at the page corner and listens to window instead of the container.
- Reduced-motion support is built in and changes `smooth` scrolling to `auto`; consumers need no extra handling.

## Related

The default back-to-top label follows `ConfigProvider`; pass `aria-label` to override it.
[Tabs](../tabs/tabs.md) · [Breadcrumb](../breadcrumb/breadcrumb.md) · [Pagination](../pagination/pagination.md) · [Anchor](../anchor/anchor.md) · [Affix](../affix/affix.md) · [Stepper](../stepper/stepper.md)
