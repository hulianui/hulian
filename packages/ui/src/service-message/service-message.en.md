---
slug: service-message
name: ServiceMessage
category: feedback
group: message
tags: []
exports: [ServiceMessage]
status: enriched
---

# ServiceMessage

> Service notification card · WeChat-style in-conversation template message with source header, title, key/value fields or custom body, footer action, Avatar and icon reuse, and token-based themes · feedback/message

## When to use

Use ServiceMessage inside a message or conversation feed for a service-generated template message such as pickup reminders, delivery confirmation, or approval outcomes. It combines a source header, structured body, and mini-app footer. This is a declarative static card in the content flow; use [Notification](../notification/notification.md) or [Toast](../toast/toast.md) for transient imperative feedback.

## Import
```ts
import { ServiceMessage } from "@hulianui/ui"
```

## Props

Inherits `Omit<HTMLAttributes<HTMLDivElement>, "title">`.

| Name | Type | Default | Description |
|------|------|------|------|
| avatar | `AvatarProps` | — | Header avatar using HulianUI Avatar props such as `{src, fallback}`. |
| fields | `ServiceMessageField[]` | — | Body key/value rows in the shape `{label, value}`. Ignored when children are provided. |
| action | `ServiceMessageAction` | label `"\u5c0f\u7a0b\u5e8f"` | Right-side footer action in the shape `{label?, icon?}` plus a chevron. The built-in Chinese label means “Mini program.” |

## Events

| Event | Type | Description |
|------|------|------|
| onMore | `() => void` | When provided, renders the header overflow button. Its built-in Chinese accessible label is `"\u66f4\u591a"`, meaning “More.” |
| onAction | `() => void` | When provided, turns the entire footer row into a button. |

## Slots

| Slot | Type | Description |
|------|------|------|
| source | `ReactNode` | Service name in the header. |
| title | `ReactNode` | Primary body title. |
| children | `ReactNode` | Custom body that replaces `fields`. |
| footer | `ReactNode` | Left footer guidance. Defaults to built-in Chinese `"\u8fdb\u5165\u5c0f\u7a0b\u5e8f\u67e5\u770b"`, meaning “Open the mini program to view”; pass `null` to hide the footer. |

## Example
```tsx
<ServiceMessage
  avatar={{ fallback: "R", className: "bg-primary/10 text-primary" }}
  source="Coffee service"
  onMore={() => {}}
  title="Pickup reminder"
  fields={[
    { label: "Pickup number", value: "361" },
    { label: "Quantity", value: "1" },
    { label: "Item", value: "Orange iced tea" },
  ]}
  action={{ icon: <LayoutGrid className="size-3.5 text-primary" /> }}
  onAction={() => {}}
/>

<ServiceMessage
  avatar={{ fallback: "S", className: "bg-warning/15 text-warning" }}
  source="Delivery service"
  title="Package delivered"
  footer="View tracking details"
  action={{ label: "Details" }}
  onAction={() => {}}
>
  <p className="text-sm text-foreground">The package was signed for by the recipient.</p>
</ServiceMessage>
```

## Usage guidelines

- `children` and `fields` are mutually exclusive; children take precedence when both are present.
- Without `onMore`, the overflow control is absent. Without `onAction`, the footer is not interactive. Do not pass empty functions merely to make controls appear active.
- `footer={null}` hides the entire footer, including the action on the right.
- No other known caveats.

## Related
[Alert](../alert/alert.md) · [Banner](../banner/banner.md) · [Toast](../toast/toast.md) · [Notification](../notification/notification.md) · [Result](../result/result.md) · [GiftFeed](../gift-feed/gift-feed.md)
