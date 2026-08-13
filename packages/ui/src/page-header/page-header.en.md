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

> Page header shell · Back action, breadcrumb, title, tags, actions, and tab footer using library components with zero dependencies · navigation/inpage

## When to use

Use PageHeader to establish a consistent top section for detail and admin pages: back action, breadcrumb, primary title, status tags, right-aligned actions, and optional footer tabs. Its slots can directly compose HulianUI [Breadcrumb](../breadcrumb/breadcrumb.md), Chip, and [Tabs](../tabs/tabs.md). Use Breadcrumb alone when only hierarchy is needed.

## Import
```ts
import { PageHeader } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| backLabel | `string` | `"\u8fd4\u56de"` | Accessible label for the back button. The built-in Chinese copy means “Back.” |
| bordered | `boolean` | `false` | Whether to render a bottom divider using `<Separator/>`. |
| metaSeparator | `ReactNode` | `"·"` | Separator placed between `meta` entries. It is decorative and gets `aria-hidden` automatically. |
| titleAs | `ElementType` | `"h1"` | Element the title renders as. The heading level belongs to the page; **only the tag is handed over, the font size does not follow it** (always 20px/28px). |

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
| meta | `ReactNode[]` | Metadata row: the string of factual values under the title, joined by `metaSeparator`. The component inserts the separator between entries and skips empty ones. |
| extra | `ReactNode` | Actions on the right; wraps below the title on narrow screens. |
| footer | `ReactNode` | Footer region, commonly `<Tabs/>`. |

## Example
```tsx
// Minimal title and action
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

Handing the title tag back to the page (the header is not the top-level heading, or the title is an animated component):
```tsx
// The page h1 lives elsewhere, so demote the header title to h2
<PageHeader titleAs="h2" title="Zhang San" />

// Animated title: the animation component drops to a span inside the tag chosen by titleAs
<PageHeader titleAs="h2" title={<AnimatedTitle as="span">Zhang San</AnimatedTitle>} />
```

Metadata row (ID number, gender, insured periods, and so on):
```tsx
<PageHeader
  title="Zhang San"
  meta={[
    "330106…512",
    "Male",
    insuredPeriods && `${insuredPeriods} insured periods`, // an empty entry disappears, leaving no stray separator
    companyCount ? `${companyCount} companies` : null,
    latestEmployer && `Latest employer: ${latestEmployer}`,
  ]}
/>
```

## Usage guidelines

- `meta` holds **a series of parallel factual values**. Keep the other slots for what they are: one sentence of supporting copy goes in `subTitle`, status markers in `tags`, and block content such as tabs in `footer`.
- Empty entries in `meta` (`null`, `undefined`, `false`, `""`) are skipped, and the separator is inserted only between the entries that survive, so callers do not need to `filter(Boolean)` first. The number `0` is a factual value ("0 companies") and is kept.
- The metadata row renders as `<ul>`/`<li>` with the separator in its own `aria-hidden` decorative item, so a screen reader announces list items instead of one long string glued together by middle dots. Stop hand-rolling `span + span::before { content: "·" }`.
- When migrating away from `span + span::before { content: "·" }`, **check the entries one by one instead of copying the row over**. That selector really means "insert a dot only between adjacent rendered `<span>` elements", so wherever the old row mixed in a button, icon, or link (rendered as `<button>`, `<svg>`, or `<a>`) there was **never a dot in production**. A `meta` entry, by contrast, is an **array item**: the separator goes between items regardless of what each one renders as. Porting a mixed row such as `[idNumber, <CopyButton/>]` verbatim adds a separator that was not there before, which is a real visual regression rather than a bug in this component (hulianui/hulian#247).
- `titleAs` hands over the tag, not the font size: after switching to `h2` the title is still 20px/28px. Adjust the size with a descendant selector on `className` (which lands on the outer `<header>`), rather than nesting an extra element inside `title` whose utility classes override the parent size, which leaves two conflicting font-size declarations on one heading.
- `title` is a `ReactNode`, which conflicts with `HTMLAttributes.title?: string`; the native attribute is omitted from the type. Do not expect a string `title` to pass through to the DOM.
- The default back label follows `ConfigProvider`, while `backLabel` overrides it. PageHeader is therefore a client component; server components can still import and render it.

## Related
[Tabs](../tabs/tabs.md) · [Breadcrumb](../breadcrumb/breadcrumb.md) · [Pagination](../pagination/pagination.md) · [Anchor](../anchor/anchor.md) · [Affix](../affix/affix.md) · [BackTop](../back-top/back-top.md)
