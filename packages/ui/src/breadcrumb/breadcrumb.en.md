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

`BreadcrumbItem`

| Name | Type | Default | Description |
|------|------|------|------|
| label * | `ReactNode` | — | Displayed content. |
| href | `string` | — | Link destination. Omitting it renders a non-interactive item, such as the current page or an ancestor without its own destination. |
| current | `boolean` | — | Explicitly marks the current page; when no item sets it, the final entry is current. |
| render | `ReactElement` | — | Render the entry as a custom element (`next/link`, the `react-router` `Link`, and so on). The skin classes and `aria-current` are merged into that element, and `label` becomes its children. |

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

Wiring up a client router (Next.js, react-router) through the same `render` contract used by `Button`, `Link`, and `NavMenuItem`:
```tsx
<Breadcrumb
  items={[
    { label: "Customers", render: <Link href="/customers" /> },
    { label: "Zhang San" }, // The final entry is the current page; leave render off to keep it non-interactive
  ]}
/>
```

## Usage guidelines

- An intermediate item without `href` renders as non-interactive text, which is useful for an ancestor such as Archives that has no standalone page.
- Avoid a bare `href` inside a single-page app, because it triggers a full page load. Pass the framework's `Link` through `render` instead: the element is really rendered rather than having its clicks hijacked on the `<nav>`, so Cmd+click to open a new tab, middle click, and Shift+click all keep working without hand-written modifier checks.
- An entry that sets `render` always uses it: even the current page renders as that element, only with `aria-current="page"` added. Leave `render` off the final entry when the current page should stay non-interactive. `href` normally comes from the element itself; when the entry also sets `href`, the entry wins.
- Class merge order matches the other `render` slots in the library: the component's own skin classes come first and the `className` on the `render` element comes last, so the latter wins.

## Related
[Tabs](../tabs/tabs.md) · [Pagination](../pagination/pagination.md) · [Anchor](../anchor/anchor.md) · [Affix](../affix/affix.md) · [BackTop](../back-top/back-top.md) · [Stepper](../stepper/stepper.md)
