---
slug: live-chat
name: LiveChat
category: data-display
group: collection
tags: []
exports: [LiveChat]
status: enriched
---

# LiveChat

> Livestream chat · high-frequency auto-scrolling messages with five message skins, user levels and badges, pinned content, new-message recovery, bounded window, custom rendering, and video-overlay mode · data-display/collection

## When to use

Use LiveChat for a one-way livestream public chat. Enable overlay over video. Use [Conversation](../conversation/conversation.md) for AI turns or [LogViewer](../log-viewer/log-viewer.md) for structured logs.

## Import
```ts
import { LiveChat } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| items* | `LiveChatItem[]` | — | Controlled appended messages. |
| pinned | `LiveChatItem[]` | — | Pinned notices above the stream. |
| autoScroll | `boolean` | `true` | Sticks to bottom until the user scrolls up. |
| maxItems | `number` | `200` | Render-window limit. |
| overlay | `boolean` | `false` | Light text and shadow over dark video. |
| className | `string` | — | Container class. |

## Slots

| Slot | Type | Description |
|------|------|------|
| renderItem | `(item: LiveChatItem) => ReactNode` | Custom item renderer. |

`LiveChatItem` is `{ id; type: "message"｜"enter"｜"gift"｜"follow"｜"system"; user?; text?; gift?; at? }`. `LiveChatUser` is `{ name; avatar?; level?; badge? }`.

## Examples
```tsx
<LiveChat items={items}
  pinned={[{ id: "p1", type: "system", text: "Giveaway at 8 PM—follow for updates" }]}
  className="h-full" />
```

Types receive built-in skins:
```tsx
const item: LiveChatItem = r === 0 ? { id, type: "enter", user: { name } }
  : r === 3 ? { id, type: "gift", user: { name }, gift: { name: "Heart", icon: "💖", combo: 3 } }
  : { id, type: "message", user: { name, level: 12 }, text: "Link?" };
```

## Usage notes

- The separator after a message author follows `ConfigProvider locale`: the Chinese default is exactly `：`, while `enUS` uses `:`. Older custom dictionaries without this field keep the Chinese fallback.

- Scrolling up pauses sticky-bottom behavior and exposes a new-message recovery button; do not force external scrolling.
- Give the stream a fixed-height container.
- Keep `maxItems` bounded rather than passing complete history.
- Built-in “Pinned / new messages / joined / followed / sent” copy follows `ConfigProvider locale`; `enUS` provides English, and the no-provider fallback remains Chinese.

## Related
[Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md)
