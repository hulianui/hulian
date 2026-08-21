---
slug: gift-feed
name: GiftFeed
category: feedback
group: message
tags: [animated]
exports: [GiftFeed, applyGiftEvent]
status: enriched
---

# GiftFeed

> Gift streak · Controlled event stream that merges repeated ids into bouncing combo counts, slides banners in, resets dismissal timers, enforces a visible limit, and uses Avatar in a pointer-transparent live-stream effect · feedback/message · #animated

## When to use

Use GiftFeed in live or interactive experiences to show donation streak banners. Rapid gifts with the same id merge into `combo ×N`, reset the dismissal timer, and displace the oldest banner after the visible limit. This is a `pointer-events:none` effect layer above content. Use [Result](../result/result.md) for general outcomes, [Notification](../notification/notification.md) for ordinary messages, or pair it with [FloatingReactions](../floating-reactions/floating-reactions.md) for floating likes.

## Import
```ts
import { GiftFeed, applyGiftEvent } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| events* | `GiftEvent[]` | - | Append-only controlled stream. `GiftEvent` is `{id, user:{name,avatar?}, gift:{name,icon?,color?}, combo?}`; another event with the same id continues the streak. |
| max | `number` | `3` | Maximum simultaneously visible banners; the oldest is removed first. |
| duration | `number` | `4000` | Milliseconds a banner remains after its last event. |
| className | `string` | - | Container class name. |

`applyGiftEvent` is an exported pure function that merges an event into visible banners, increments or applies combo, and enforces max for isolated tests.

## Example
```tsx
const [events, setEvents] = useState<GiftEvent[]>([]);

function onGift(g: GiftEvent) {
  setEvents((prev) => [...prev.slice(-30), g]);
}

<div className="relative h-72 w-80">
  <GiftFeed events={events} max={3} duration={4000} className="w-full" />
</div>
```

## Usage guidelines

- `events` is append-stream data. Only an identical `id` continues a streak; give distinct gifts distinct ids to prevent accidental merging.
- The caller maintains and increments `combo`; without it, the component counts appearances.
- Bound the events array, as in `.slice(-30)`, so a long-running stream does not grow indefinitely.
- The banner's built-in Chinese verb is `"\u9001\u51fa"`, meaning “sent.” It renders between the user name and gift name; supply already-localized user and gift content for an English experience.

## Related
[Alert](../alert/alert.md) · [Banner](../banner/banner.md) · [Toast](../toast/toast.md) · [Notification](../notification/notification.md) · [ServiceMessage](../service-message/service-message.md) · [Result](../result/result.md)
