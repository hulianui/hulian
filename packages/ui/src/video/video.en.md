---
slug: video
name: Video
category: data-display
group: collection
tags: []
exports: [Video, formatTime, normalizeSrc, chapterMarkers, DEFAULT_PLAYBACK_RATES]
status: enriched
---

# Video

> Plays file or HLS video with custom controls, chapters, resume, picture-in-picture, and fullscreen. · data-display/collection

## When to use

Use Video for course media, product demonstrations, or replay streams that need branded controls, chapters, resume position, and an end screen. Use [Card](../card/card.md) for a static cover.

## Import
```ts
import { Video, formatTime, normalizeSrc, chapterMarkers, DEFAULT_PLAYBACK_RATES } from "@hulianui/ui"
```

## Props

`VideoProps`:

| Name | Type | Default | Description |
|------|------|------|------|
| src* | `string \| { src: string; type? }[]` | - | File URL, HLS `.m3u8`, or multiple sources. |
| poster | `string` | - | Poster image. |
| title | `string` | - | Accessible title used by internal controls. |
| autoPlay | `boolean` | - | Starts playback automatically. |
| muted | `boolean` | - | Starts muted. |
| loop | `boolean` | - | Repeats playback. |
| crossOrigin | `boolean \| string` | - | Forwarded media crossorigin setting. |
| aspectRatio | `string` | `"16/9"` | CSS aspect ratio. |
| playbackRates | `number[]` | `DEFAULT_PLAYBACK_RATES`(0.5-2) | Available playback speeds. |
| chapters | `VideoChapter[]` | - | `{ time, title }` segments rendered as progress ticks and hover titles. |
| startTime | `number` | - | One-time initial seek in seconds after media becomes playable. |
| className | `string` | - | Root class name. |

## Events

| Event | Type | Description |
|------|------|------|
| onPlay | `() => void` | Playback started. |
| onPause | `() => void` | Playback paused. |
| onEnded | `() => void` | Playback ended. |
| onTimeUpdate | `(currentTime: number) => void` | Current time in seconds. |

## Slots

| Slot | Type | Description |
|------|------|------|
| endScreen | `ReactNode` | Overlay shown after completion; omission leaves only replay. |
| children | `ReactNode` | Reserved for a future extension and currently unused. |

> `formatTime`, `chapterMarkers`, `normalizeSrc`, and `DEFAULT_PLAYBACK_RATES` are exported pure helpers or constants.

## Localization

Built-in play, pause, mute, speed, picture-in-picture, fullscreen, and replay
labels follow the nearest `ConfigProvider locale`. Both `zhCN` and `enUS` are
included. A legacy custom locale without `components.video` keeps the original
Chinese fallback labels instead of rendering empty accessible names.

## Examples
```tsx
<Video src="/demo/sample.mp4" poster="/demo/poster.jpg" title="Demo video" className="w-full max-w-2xl" />

<Video
  src="/demo/hls/stream.m3u8"
  title="Chaptered video"
  startTime={4}
  chapters={[
    { time: 0, title: "Introduction" },
    { time: 6, title: "Practical demo" },
  ]}
/>
```

## Usage notes

- Vidstack makes Video client-only. Render it below a `"use client"` boundary in Next.js.
- `startTime` seeks once only when first playable and only above zero; later prop changes do not seek again.
- Chapter ticks require a finite nonzero duration, so they are absent before metadata loads.
- Built-in Chinese controls are `"\u64ad\u653e\u901f\u5ea6"` (“Playback speed”), `"\u91cd\u65b0\u64ad\u653e"` (“Replay”), `"\u64ad\u653e\u89c6\u9891"` (“Play video”), `"\u64ad\u653e"` / `"\u6682\u505c"` (“Play” / “Pause”), `"\u53d6\u6d88\u9759\u97f3"` / `"\u9759\u97f3"` (“Unmute” / “Mute”), `"\u9000\u51fa\u753b\u4e2d\u753b"` / `"\u753b\u4e2d\u753b"` (“Exit PiP” / “PiP”), and `"\u9000\u51fa\u5168\u5c4f"` / `"\u5168\u5c4f"` (“Exit fullscreen” / “Fullscreen”).

## Related
[Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md)
