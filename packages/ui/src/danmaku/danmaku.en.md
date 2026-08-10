---
slug: danmaku
name: Danmaku
category: data-display
group: collection
tags: [animated]
exports: [Danmaku, allocateTrack, densityGap, estimateWidth, leastBusyTrack, scrollDuration, trackFreeTime]
status: enriched
---

# Danmaku

> Bullet-comment engine · collision-safe track allocation with scrolling, top, and bottom modes, density controls, pause, pointer passthrough, and tested geometry helpers · data-display/collection · #animated

## When to use

Use Danmaku over a livestream or video, commonly in [LivePlayer](../live-player/live-player.md)'s overlay. Use [LiveChat](../live-chat/live-chat.md) for a scrolling public message list.

## Import
```ts
import { Danmaku, allocateTrack, densityGap, estimateWidth, leastBusyTrack, scrollDuration, trackFreeTime } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| items* | `DanmakuItem[]` | — | Controlled append-only stream; unseen ids enter once. |
| tracks | `number` | `4` | Scrolling tracks. |
| speed | `number` | `100` | Speed in pixels per second. |
| density | `"low" \| "normal" \| "high"` | `"normal"` | Safety gap and overflow pressure. |
| area | `number` | `1` | Used height ratio from 0 to 1. |
| opacity | `number` | `1` | Overall opacity. |
| paused | `boolean` | `false` | Pauses all animations. |
| className | `string` | — | Container class. |

`DanmakuItem`

| Name | Type | Default | Description |
|------|------|------|------|
| id * | `string` | — | Deduplication key: it decides whether an item has already entered, so only unseen ids animate in. |
| text * | `ReactNode` | — | Comment content. |
| mode | `"scroll" \| "top" \| "bottom"` | `"scroll"` | Scrolling, pinned to the top, or pinned to the bottom. |
| color | `string` | Inherits the foreground token | Text color. |
| size | `"sm" \| "md" \| "lg"` | `"md"` | Font size preset. |
| bold | `boolean` | `false` | Bold text. |

## Examples
```tsx
<div className="relative aspect-video">
  <video src="/stream.mp4" muted autoPlay loop className="absolute inset-0 h-full w-full" />
  <Danmaku items={items} tracks={4} speed={100} density="normal" />
</div>
```

Append new ids to enter:
```tsx
setItems((p) => [...p.slice(-60), { id: `d${i}`, text: "Watching from the front row", mode: "scroll" }]);
```

## Usage notes

- Editing an existing id does not replay it; assign a new id.
- Trim long-running streams to bound memory.
- The parent needs relative positioning and hidden overflow. Danmaku fills it with pointer events disabled.
- Width estimation for non-string content uses the runtime fallback `"\u5f39\u5e55\u5f39\u5e55\u5f39\u5e55"` (three repetitions of "bullet comment") as a medium-width sample; it is not rendered to users.

## Related
[Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md)
