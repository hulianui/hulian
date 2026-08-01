---
slug: notification
name: Notification
category: feedback
group: message
tags: []
exports: [notification, NotificationProvider, hulianNotificationManager]
status: enriched
---

# Notification

> Notification · Corner-stacked card with icon, actions, placement, and an imperative API richer than Toast · feedback/message

## When to use

Use Notification for a substantial corner message with a title, description, and optional action, such as a friend request or a retryable upload failure. It carries more information than [Toast](../toast/toast.md), can persist, and supports actions. Use Toast for one short automatically dismissed line. Calls are imperative, but NotificationProvider must be mounted once by the layout.

## Import
```ts
import { notification, NotificationProvider, hulianNotificationManager } from "@hulianui/ui"
```

## Props

`notification.success/error/info/warning/open(options)` accepts `NotificationOptions`:

| Name | Type | Default | Description |
|------|------|------|------|
| type | `"open"｜"success"｜"error"｜"info"｜"warning"` | — | Implied by the method. `open` is neutral without a default icon; other types derive the accent and icon from Alert-aligned tokens. |
| duration | `number` | `4500` | Automatic dismissal in milliseconds. `0` remains open. |
| placement | `"topRight"｜"topLeft"｜"bottomRight"｜"bottomLeft"` | `"topRight"` | Screen corner. |

The returned `NotificationInstance` provides `destroy(): void` for immediate programmatic dismissal.

The notification close control uses the built-in Chinese `aria-label` `"\u5173\u95ed"`, meaning “Close.”

## Events

| Event | Type | Description |
|------|------|------|
| onClose | `() => void` | Called once after automatic, manual, or programmatic dismissal. |

## Slots

| Slot | Type | Description |
|------|------|------|
| title | `ReactNode` | Bold primary line. |
| description | `ReactNode` | Muted secondary line. |
| icon | `ReactNode` | Custom icon replacing the type-derived default. |
| btn | `ReactNode` | Action area rendered below the description. |

## Example
```tsx
// Automatically closes after 4.5 seconds
notification.success({ title: "Saved", description: "Changes are synchronized." })

// Persistent notification with an action
notification.open({
  title: "New friend request",
  description: "From the Design team",
  duration: 0,
  btn: <Button size="sm" onClick={() => {}}>View</Button>,
})
```

## Usage guidelines

- Mount NotificationProvider once in the layout, following Toast and Modal. Do not mount it at every call site or showcase.
- Only `duration: 0` persists; omission closes after 4500 ms. Set zero explicitly for information that must be acknowledged.
- An imperative notification is fire-and-forget. `onClose` runs once but should not depend on stale captured application state; see [[fire-and-forget-side-effect-notification]].

## Related
[Alert](../alert/alert.md) · [Banner](../banner/banner.md) · [Toast](../toast/toast.md) · [ServiceMessage](../service-message/service-message.md) · [Result](../result/result.md) · [GiftFeed](../gift-feed/gift-feed.md)
