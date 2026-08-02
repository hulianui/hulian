---
slug: live-player
name: LivePlayer
category: data-display
group: collection
tags: []
exports: [LivePlayer]
status: enriched
---

# LivePlayer

> Livestream player shell · minimal autoplay video or custom surface with LIVE badge, viewer count, quality menu, host row, overlays, footer, and portrait or landscape layout · data-display/collection

## When to use

Use LivePlayer for livestream semantics without VOD scrubber controls. Use [Video](../video/video.md) for seekable playback. Pair overlay with [Danmaku](../danmaku/danmaku.md).

## Import
```ts
import { LivePlayer } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| src | `string` | — | Video source played muted, looping, autoplay, and inline. |
| poster | `string` | — | Poster image. |
| live | `boolean` | `true` | Shows the LIVE badge. |
| viewers | `number` | — | Animated viewer count. |
| qualities | `string[]` | — | Quality options. |
| quality | `string` | — | Controlled current quality. |
| host | `LivePlayerHost` | — | Host row. |
| orientation | `"portrait" \| "landscape"` | `"landscape"` | Layout orientation. |
| aspectRatio | `string` | — | CSS ratio; defaults to 16/9 or 9/16, while `"fill"` fills the parent. |
| className | `string` | — | Container class. |

## Events

| Event | Type | Description |
|------|------|------|
| onQualityChange | `(q: string) => void` | Quality selection. |

## Slots

| Slot | Type | Description |
|------|------|------|
| surface | `ReactNode` | Custom scene taking precedence over src. |
| overlay | `ReactNode` | Danmaku, reactions, or gifts above the scene. |
| footer | `ReactNode` | Interaction bar. |

`LivePlayerHost` is `{ name; avatar?; followed?; onFollow?; meta? }`; the follow control appears only with `onFollow`.

## Example
```tsx
<LivePlayer src="/stream.mp4" viewers={12840}
  qualities={["Blu-ray", "Ultra", "HD"]} quality={quality} onQualityChange={setQuality}
  host={{ name: "Host Nan", meta: "286K followers", followed, onFollow: () => setFollowed(true) }}
  overlay={<Danmaku items={items} />} footer={<InteractionBar />} />
```

## Usage notes

- Quality is controlled; write changes back.
- Omit host.onFollow for display-only host details.
- Surface overrides src. The built-in video intentionally exposes no VOD controls.
- Follow-state copy follows `ConfigProvider locale`; `enUS` provides “+ Follow / Following”, and the no-provider fallback remains Chinese.

## Related
[Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md)
