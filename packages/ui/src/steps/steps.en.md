---
slug: steps
name: Steps
category: navigation
group: inpage
tags: []
exports: [Steps]
status: enriched
---

# Steps

> Communicates progress and status across an ordered multi-step process. · navigation/inpage

## When to use

Use Steps to show progress through a multistep form, order lifecycle, or approval flow. It supports horizontal and vertical layouts, derived or explicit states, clickable controlled navigation, descriptions, and custom icons. [Stepper](../stepper/stepper.md) is a lightweight progress display; choose Steps for richer workflows.

## Import
```ts
import { Steps } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| items* | `StepsItem[]` | - | Step data described below. |
| current | `number` | `0` | Zero-based current step used to derive each item's state. |
| status | `"process" \| "finish" \| "error"` | `"process"` | State assigned to the item whose index equals `current`. |
| direction | `"horizontal" \| "vertical"` | `"horizontal"` | Layout direction. |
| size | `"sm" \| "md"` | `"md"` | Component size. |
| className | `string` | - | Additional class name. |

The list uses the built-in Chinese `aria-label` `"\u6b65\u9aa4"`, meaning “Steps.”

**StepsItem**

| Field | Type | Description |
|------|------|------|
| title* | `ReactNode` | Step title. |
| description | `ReactNode` | Secondary copy below the title. |
| icon | `ReactNode` | Custom indicator replacing the default number or status icon. |
| status | `"wait" \| "process" \| "finish" \| "error"` | Explicit item state overriding the state derived from `current`. |
| disabled | `boolean` | Prevents selection and reduces opacity. |

## Events

| Event | Type | Description |
|------|------|------|
| onChange | `(index: number) => void` | When provided, makes steps clickable and reports the index of a selected non-disabled item. |

## Example
```tsx
const ORDER = [
  { title: "Submit", description: "Complete the expense form" },
  { title: "Department approval", description: "Manager reviews the amount" },
  { title: "Payment", description: "Finance sends the transfer" },
  { title: "Complete", description: "Archive the case" },
];

// Static progress
<Steps items={ORDER} current={1} />

// Clickable and controlled
const [current, setCurrent] = useState(1);
<Steps items={ORDER} current={current} onChange={setCurrent} />
```

## Usage guidelines

- By default, indices below `current` derive `finish`, the current index derives `status` (`process` by default), and later indices derive `wait`. Set `StepsItem.status` to override one item.
- Items become clickable only when `onChange` is provided. Selecting a disabled item does not call the callback.

## Related
[Tabs](../tabs/tabs.md) · [Breadcrumb](../breadcrumb/breadcrumb.md) · [Pagination](../pagination/pagination.md) · [Anchor](../anchor/anchor.md) · [Affix](../affix/affix.md) · [BackTop](../back-top/back-top.md)
