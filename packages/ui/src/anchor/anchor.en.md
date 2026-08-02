---
slug: anchor
name: Anchor
category: navigation
group: inpage
tags: []
exports: [Anchor, flattenAnchorItems]
status: enriched
---

# Anchor

> Anchor navigation · Dependency-free IntersectionObserver scrollspy, smooth scrolling, CSS-variable active indicator, top offset, and one nested level · navigation/inpage

## When to use

Use Anchor for a table of contents beside long-form material such as API documentation, privacy policies, product guides, or sectioned settings. It highlights the current section while scrolling and smoothly moves to a section when selected. Use [Tabs](../tabs/tabs.md) for mutually exclusive peer content, [Breadcrumb](../breadcrumb/breadcrumb.md) for hierarchy, or wrap Anchor in [Affix](../affix/affix.md) to keep the table of contents visible while scrolling.

## Import
```ts
import { Anchor, flattenAnchorItems } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| items* | `AnchorItem[]` | — | Anchor entries with one optional child level. |
| offsetTop | `number` | `0` | Space reserved above the target in pixels, typically for a fixed header. Also moves the upper scrollspy boundary. |
| getContainer | `() => HTMLElement \| null` | `undefined` (window) | Custom scroll container. Required when the actual scroller is not window. |

`AnchorItem` is `{ href: string; title: ReactNode; children?: AnchorItem[] }`. Each `href`, such as `"#section-id"`, must match an element id on the page.

The inherited `aria-label` defaults to the built-in Chinese copy `"\u951a\u70b9\u5bfc\u822a"`, meaning “Anchor navigation.” Pass an English label for an English interface.

## Events

| Event | Type | Description |
|------|------|------|
| onChange | `(href: string) => void` | Called when the active anchor changes through a click or scrolling; repeated identical values are suppressed. |

## Example
```tsx
<Anchor
  items={[
    { href: "#sec-overview", title: "Overview" },
    {
      href: "#sec-guide",
      title: "Quick start",
      children: [
        { href: "#sec-install", title: "Installation" },
        { href: "#sec-usage", title: "Basic usage" },
      ],
    },
    { href: "#sec-faq", title: "FAQ" },
  ]}
/>
```

For an inner `overflow-y-auto` scroller:
```tsx
<Anchor items={items} getContainer={() => document.querySelector("main")} />
```

## Usage guidelines

- [[scrollspy-anchor-hardcoded-window-scroll-breaks-in-inner-container]]: when an inner element such as `<main class="overflow-y-auto">` or `Layout.Content` is the true scroller, pass it through `getContainer`. Otherwise both the IntersectionObserver root and click scrolling target the wrong container, so scrolling and highlighting fail.
- One nested level is intentional. Deeper tables of contents quickly become unreadable in a narrow rail; use collapsible tree navigation instead.
- The component includes `"use client"` and can be used as a client island within an RSC page.

## Related
[Tabs](../tabs/tabs.md) · [Breadcrumb](../breadcrumb/breadcrumb.md) · [Pagination](../pagination/pagination.md) · [Affix](../affix/affix.md) · [BackTop](../back-top/back-top.md) · [Stepper](../stepper/stepper.md)
