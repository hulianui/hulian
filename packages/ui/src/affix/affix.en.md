---
slug: affix
name: Affix
category: navigation
group: inpage
tags: []
exports: [Affix]
status: enriched
---

# Affix

> Pins content after a scroll threshold while preserving its layout position. · navigation/inpage

## When to use

Use Affix when content such as an action bar, table of contents, or form submit row should switch to `position:fixed` after crossing a scroll threshold. An equal-height placeholder preserves layout at its original position. Use [Anchor](../anchor/anchor.md) to jump between page sections or [BackTop](../back-top/back-top.md) for a single return-to-top action; Affix pins arbitrary `children` at a viewport edge.

## Import
```ts
import { Affix } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| offsetTop | `number` | `0` | Distance in pixels from the container top at which the content becomes fixed. |
| offsetBottom | `number` | - | Distance from the container bottom. Used only when `offsetTop` is absent; top takes precedence when both are provided. |
| target | `HTMLElement \| Window \| null \| (() => HTMLElement \| Window \| null)` | `window` | Scroll event target, provided directly or through a getter. |
| affixedClassName | `string` | - | Class name added while fixed, such as `shadow-lg`. |

> Also inherits `HTMLAttributes<HTMLDivElement>` except `children` and `onChange`.

## Events

| Event | Type | Description |
|------|------|------|
| onChange | `(affixed: boolean) => void` | Called when the affixed state changes. |

## Slots

| Slot | Type | Description |
|------|------|------|
| children* | `ReactNode` | Content to pin. |

## Example
```tsx
const ref = useRef<HTMLDivElement>(null);

<div ref={ref} className="h-64 overflow-auto">
  <Affix target={() => ref.current} offsetTop={8} affixedClassName="shadow-lg">
    <div className="rounded bg-primary px-4 py-2 text-bg">Action bar</div>
  </Affix>
  {/* Long content */}
</div>
```

## Usage guidelines

- When an intermediate element such as `<main class="overflow-y-auto">` is the actual scroller, pass it through `target`. The implementation captures window scroll events to cover intermediate containers; without the correct target, the fixed bar can retain stale viewport coordinates and drift outside its container. See [[affix-fixed-must-capture-scroll-for-intermediate-container]].
- Documentation previews and other layouts where window does not scroll must target their real scroll frame or Affix never activates.

## Related
[Tabs](../tabs/tabs.md) · [Breadcrumb](../breadcrumb/breadcrumb.md) · [Pagination](../pagination/pagination.md) · [Anchor](../anchor/anchor.md) · [BackTop](../back-top/back-top.md) · [Stepper](../stepper/stepper.md)
