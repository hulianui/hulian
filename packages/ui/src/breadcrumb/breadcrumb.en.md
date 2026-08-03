---
slug: breadcrumb
name: Breadcrumb
category: navigation
group: inpage
tags: []
exports: [Breadcrumb]
status: enriched
---

# Breadcrumb

> Breadcrumb · Static styling with `aria-current` semantics for the current page · navigation/inpage

## When to use

Use Breadcrumb to show the current page's position in the site hierarchy and provide links back through each ancestor, for example Home / Components / Breadcrumb. Use [Tabs](../tabs/tabs.md) to switch peer content in one region, [Pagination](../pagination/pagination.md) to move through pages, or [Stepper](../stepper/stepper.md) for an ordered process.

## Import
```ts
import { Breadcrumb } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| items* | `BreadcrumbItem[]` | — | Path entries ordered from the root to the current page. |

`BreadcrumbItem` is `{ label: ReactNode; href?: string; current?: boolean }`. Omitting `href` renders a non-interactive item, such as the current page or an ancestor without its own destination. `current` explicitly marks the current page; when no item sets it, the final entry is current.

## Slots

| Slot | Type | Description |
|------|------|------|
| separator | `ReactNode` | Separator between entries. Defaults to `"/"`; alternatives such as a chevron are automatically marked decorative with `aria-hidden`. |

## Example
```tsx
<Breadcrumb
  items={[
    { label: "Home", href: "/" },
    { label: "Components", href: "/components" },
    { label: "Breadcrumb" }, // Final item without href is the current page
  ]}
/>
```

With a chevron separator:
```tsx
<Breadcrumb items={items} separator={<ChevronIcon />} />
```

## Usage guidelines

There are no known caveats. An intermediate item without `href` renders as non-interactive text, which is useful for an ancestor such as Archives that has no standalone page.

## Related
[Tabs](../tabs/tabs.md) · [Pagination](../pagination/pagination.md) · [Anchor](../anchor/anchor.md) · [Affix](../affix/affix.md) · [BackTop](../back-top/back-top.md) · [Stepper](../stepper/stepper.md)
