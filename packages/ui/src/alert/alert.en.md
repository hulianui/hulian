---
slug: alert
name: Alert
category: feedback
group: message
tags: []
exports: [Alert, alertVariants]
status: enriched
---

# Alert

> Alert · Tone and variant styling with accessible alert semantics · feedback/message

## When to use

Use Alert for persistent contextual feedback within a page or section, such as a validation summary, status explanation, or inline warning. Use [Banner](../banner/banner.md) for a full-width announcement, [Toast](../toast/toast.md) for transient imperative feedback, or [Notification](../notification/notification.md) for a richer notification in a screen corner.

## Import
```ts
import { Alert, alertVariants } from "@hulianui/ui"
```

## Props

Inherits `HTMLAttributes<HTMLDivElement>` except `title`, plus `alertVariants`:

| Name | Type | Default | Description |
|------|------|------|------|
| tone | `"neutral"\|"brand"\|"info"\|"success"\|"warning"\|"danger"` | `"info"` | Semantic tone. `info` is a legacy alias of `brand` with the same recipe. |
| variant | `"soft"\|"outline"` | `"soft"` | Soft background or outlined treatment. |
| closeLabel | `string` | `"\u5173\u95ed"` | Close-button accessible label. The built-in Chinese copy means “Close.” |

## Events

| Event | Type | Description |
|------|------|------|
| onClose | `() => void` | When provided, renders a close button and reports activation; the consumer controls removal. |

## Slots

| Slot | Type | Description |
|------|------|------|
| icon | `ReactNode` | Optional caller-provided SVG or emoji; the design system does not bind an icon library. |
| title | `ReactNode` | Optional title; children provide the description. |
| action | `ReactNode` | Action beside the close button, such as `<Button>Retry</Button>`. |

## Example
```tsx
<Alert tone="success" icon={SuccessIcon} title="Saved">Your profile has been updated.</Alert>

<Alert tone="danger" title="Cannot connect" onClose={() => setShown(false)} action={<Button>Retry</Button>}>
  A connection problem occurred. Try again later.
</Alert>
```

## Usage guidelines

- `onClose` reports intent but does not hide the alert. The consumer controls rendering; without it, no close button appears.
- Supply icons yourself as SVG or emoji.
- The props omit native HTML `title` so the component's `ReactNode` title is unambiguous.
- Prefer `tone="brand"` in new code for consistency with Tag, Button, and Badge. `info` remains an equivalent legacy alias, but mixing both makes cross-component tone searches incomplete.

## Related
[Banner](../banner/banner.md) · [Toast](../toast/toast.md) · [Notification](../notification/notification.md) · [ServiceMessage](../service-message/service-message.md) · [Result](../result/result.md) · [GiftFeed](../gift-feed/gift-feed.md)
