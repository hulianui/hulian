---
slug: floating-reactions
name: FloatingReactions
category: feedback
group: message
tags: [animated]
exports: [FloatingReactions]
status: enriched
---

# FloatingReactions

> Floating reactions · Imperative `ref.emit(content,{count})` burst with randomized origin, drift, scale, and duration, automatic keyframe cleanup, palette sampling, and pointer-transparent overlay · feedback/message · #animated

## When to use

Use FloatingReactions as an effect layer that emits hearts or other reactions upward from a like control. Call `ref.emit()` imperatively; each item randomizes its origin, drift, and scale, fades out, and removes itself. Use [GiftFeed](../gift-feed/gift-feed.md) when gifts need streak merging and a counted banner.

## Import
```ts
import { FloatingReactions } from "@hulianui/ui"
```

## Props

Access `FloatingReactionsHandle` through a ref and call `emit(content?, opts?: { count?: number })`; when content is absent, an entry is sampled from palette.

| Name | Type | Default | Description |
|------|------|------|------|
| palette | `ReactNode[]` | Heart set | Reaction pool used when emit has no content. |
| rise | `number` | `220` | Vertical travel in pixels. |
| drift | `number` | `40` | Random horizontal travel in pixels. |
| duration | `number` | `2200` | Animation duration in milliseconds. |
| size | `number` | `24` | Font size in pixels. |
| className | `string` | - | Container class name. |

## Example
```tsx
const ref = useRef<FloatingReactionsHandle>(null);

<div className="relative h-72 w-64 overflow-hidden">
  <button onClick={() => ref.current?.emit("❤️", { count: 3 })}>Like ❤</button>
  <FloatingReactions ref={ref} />
</div>
```

## Usage guidelines

- Trigger through the ref's `emit`; no prop starts a burst. The containing element needs `position:relative` and usually `overflow-hidden`.
- Reaction elements use `pointer-events:none`, so an overlay above a control does not intercept clicks.
- No other known caveats.

## Related
[Alert](../alert/alert.md) · [Banner](../banner/banner.md) · [Toast](../toast/toast.md) · [Notification](../notification/notification.md) · [ServiceMessage](../service-message/service-message.md) · [Result](../result/result.md)
