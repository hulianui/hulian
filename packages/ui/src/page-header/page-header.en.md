---
slug: page-header
name: PageHeader
category: navigation
group: inpage
tags: []
exports: [PageHeader]
status: enriched
---

# PageHeader

> Page header shell · Back action, breadcrumb, title, tags, actions, and tab footer using library components, with zero dependencies and optional RSC use · navigation/inpage

## When to use

Use PageHeader to establish a consistent top section for detail and admin pages: back action, breadcrumb, primary title, status tags, right-aligned actions, and optional footer tabs. Its slots can directly compose HulianUI [Breadcrumb](../breadcrumb/breadcrumb.md), Chip, and [Tabs](../tabs/tabs.md). Use Breadcrumb alone when only hierarchy is needed. Omitting `onBack` allows the consumer to remain an RSC.

## Import
```ts
import { PageHeader } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| backLabel | `string` | `"\u8fd4\u56de"` | Accessible label for the back button. The built-in Chinese copy means “Back.” |
| bordered | `boolean` | `false` | Whether to render a bottom divider using `<Separator/>`. |

> Also inherits `HTMLAttributes<HTMLElement>` except `title`, whose type is replaced with `ReactNode`.

## Events

| Event | Type | Description |
|------|------|------|
| onBack | `() => void` | When provided, renders a back-arrow button before the title and calls this handler on activation. A callback requires the consumer to be a client component. |

## Slots

| Slot | Type | Description |
|------|------|------|
| title* | `ReactNode` | Primary title. |
| subTitle | `ReactNode` | Muted secondary title displayed inline after the primary title. |
| breadcrumb | `ReactNode` | Breadcrumb region above the title row, typically a HulianUI `<Breadcrumb/>`. |
| tags | `ReactNode` | Status indicators beside the title, such as `<Chip/>` or `<Badge/>`. |
| extra | `ReactNode` | Actions on the right; wraps below the title on narrow screens. |
| footer | `ReactNode` | Footer region, commonly `<Tabs/>`. |

## Example
```tsx
// Minimal title and action; remains an RSC because onBack is absent
<PageHeader title="Users" extra={<Button variant="solid" size="sm">New user</Button>} />

// Complete header
<PageHeader
  onBack={() => router.back()}
  breadcrumb={<Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Order details" }]} />}
  title="Order #20260603-8821"
  subTitle="6 items"
  tags={<Chip tone="brand" variant="soft" size="sm">In progress</Chip>}
  extra={<Button variant="solid" size="sm">Edit</Button>}
  footer={<Tabs defaultValue="detail"><TabsList><TabsTab value="detail">Details</TabsTab></TabsList></Tabs>}
  bordered
/>
```

## Usage guidelines

- `title` is a `ReactNode`, which conflicts with `HTMLAttributes.title?: string`; the native attribute is omitted from the type. Do not expect a string `title` to pass through to the DOM.
- Supplying `onBack` introduces a callback, so the consuming component must be a client component. A display-only header without `onBack` can remain server-rendered.

## Related
[Tabs](../tabs/tabs.md) · [Breadcrumb](../breadcrumb/breadcrumb.md) · [Pagination](../pagination/pagination.md) · [Anchor](../anchor/anchor.md) · [Affix](../affix/affix.md) · [BackTop](../back-top/back-top.md)
