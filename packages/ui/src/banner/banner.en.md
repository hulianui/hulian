---
slug: banner
name: Banner
category: feedback
group: message
tags: []
exports: [Banner]
status: enriched
---

# Banner

> Announcement bar · Full-width maintenance, promotion, or release message with six tones, soft/solid variants, icon, action, dismissal, alignment, and optional Marquee scrolling · feedback/message

## When to use

Use Banner for a global announcement spanning the top of a container, such as maintenance, a promotion, or a release update. Use [Alert](../alert/alert.md) for a static message inside a local section, [Toast](../toast/toast.md) for transient imperative feedback, or [Notification](../notification/notification.md) for a rich corner notification.

## Import
```ts
import { Banner } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| tone | `"neutral"｜"info"｜"brand"｜"success"｜"warning"｜"danger"` | `"info"` | Semantic tone. |
| variant | `"soft"｜"solid"` | `"soft"` | Light background or prominent solid fill. |
| align | `"start"｜"center"` | `"center"` | Content alignment. |
| scrollable | `boolean` | `false` | Scrolls long copy on one continuous CSS marquee line and pauses on hover. |
| closeLabel | `string` | `"\u5173\u95ed"` | Close-button accessible label. The built-in Chinese copy means “Close.” |
| className | `string` | — | Additional class name. |

## Events

| Event | Type | Description |
|------|------|------|
| onClose | `() => void` | When provided, renders a close button and reports activation. |

## Slots

| Slot | Type | Description |
|------|------|------|
| icon | `ReactNode` | Leading SVG icon colored from the tone. |
| children | `ReactNode` | Announcement copy. |
| action | `ReactNode` | Trailing link or button. |

## Example
```tsx
<Banner tone="success" icon={<Rocket />}>Deployment completed; traffic now uses the new release.</Banner>

<Banner variant="solid" tone="brand" icon={<Sparkles />} action={<Link href="#" className="text-current underline">View offer</Link>} onClose={() => setOpen(false)}>
  The seasonal promotion is live across all components.
</Banner>
```

## Usage guidelines

- `onClose` reports intent but does not manage visibility; remove the banner from caller state. Without it, no close control renders.
- `scrollable` is a one-line CSS marquee that pauses on hover. Do not use it for multiline content.
- In a solid banner, give links in `action` `text-current` so they follow the fill's foreground instead of hard-coding a color.

## Related
[Alert](../alert/alert.md) · [Toast](../toast/toast.md) · [Notification](../notification/notification.md) · [ServiceMessage](../service-message/service-message.md) · [Result](../result/result.md) · [GiftFeed](../gift-feed/gift-feed.md)
