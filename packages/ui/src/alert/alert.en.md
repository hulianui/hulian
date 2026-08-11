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
| tone | `"neutral"\|"brand"\|"info"\|"success"\|"warning"\|"danger"` | `"info"` | Semantic tone. `brand` uses the primary colour; `info` uses the dedicated info colour (the two stopped being identical in 0.8.0). |
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
- **`info` and `brand` are two different colours from 0.8.0 onwards and are no longer interchangeable.** `info` used to be an alias of `brand` because the library had no info colour and had to borrow the primary one. Now that `@hulianui/tokens` ships `--color-info`, `brand` stays on the primary colour while `info` moves to a hue 30° away from it. **The default Alert (`tone="info"`) therefore changes colour when you upgrade** — pass `tone="brand"` explicitly to keep the original brand blue. Choose by meaning: `brand` when the message is about the product or the main action, `info` when it is purely explanatory.

## Related
[Banner](../banner/banner.md) · [Toast](../toast/toast.md) · [Notification](../notification/notification.md) · [ServiceMessage](../service-message/service-message.md) · [Result](../result/result.md) · [GiftFeed](../gift-feed/gift-feed.md)
