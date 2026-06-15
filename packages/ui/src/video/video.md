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

> 视频播放器 · Vidstack 引擎 + 瑚琏 token 自搓皮肤(播放/进度/音量/倍速/PiP/全屏) + 文件/HLS + 章节标记/续播/结束屏 · data-display/collection

## 何时用

播放视频文件或 HLS 流并需要瑚琏风格控件——课程视频、产品演示、直播回放。本组件用 Vidstack 作引擎、自搓皮肤(播放/进度/音量/倍速/PiP/全屏)，并支持章节标记、续播定位、结束屏。相关组件里没有同类播放器，纯静态封面用 [Card](../card/card.md) 即可。

## 导入
```ts
import { Video, formatTime, normalizeSrc, chapterMarkers, DEFAULT_PLAYBACK_RATES } from "@hulianui/ui"
```

## Props

`VideoProps`：

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| src* | `string \| { src: string; type? }[]` | — | 文件 URL / HLS `.m3u8` / 多源数组 |
| poster | `string` | — | 海报图 |
| title | `string` | — | 无障碍标题，也用于内部 aria |
| autoPlay | `boolean` | — | 自动播放 |
| muted | `boolean` | — | 静音 |
| loop | `boolean` | — | 循环 |
| crossOrigin | `boolean \| string` | — | 透传给底层 media 的 crossorigin |
| aspectRatio | `string` | `"16/9"` | CSS aspect-ratio |
| playbackRates | `number[]` | `DEFAULT_PLAYBACK_RATES`(0.5–2) | 倍速档位 |
| chapters | `VideoChapter[]` | — | 章节分段(`{ time, title }`)：进度条按 time/duration 渲染 tick，hover 显示标题 |
| startTime | `number` | — | 续播：可播放后 seek 到此秒(仅初始一次，>0 才生效) |
| endScreen | `ReactNode` | — | 播完浮现的结束屏内容(如「下一节」卡片)；为空则只给重播按钮 |
| className | `string` | — | — |
| onPlay / onPause / onEnded | `() => void` | — | 播放生命周期回调 |
| onTimeUpdate | `(currentTime: number) => void` | — | 播放进度回调(秒) |

> `children` 为 v1 预留扩展位，未实现。导出的 `formatTime` / `chapterMarkers` / `normalizeSrc` / `DEFAULT_PLAYBACK_RATES` 为辅助纯函数/常量。

## 示例
```tsx
// 文件 + 海报
<Video src="/demo/sample.mp4" poster="/demo/poster.jpg" title="演示视频" className="w-full max-w-2xl" />

// HLS 流 + 章节标记 + 续播
<Video
  src="/demo/hls/stream.m3u8"
  title="带章节"
  startTime={4}
  chapters={[
    { time: 0, title: "开场介绍" },
    { time: 6, title: "实战演示" },
  ]}
/>
```

## 禁忌 / 坑

- 依赖 Vidstack 引擎，是 **client-only** 组件——在 Next.js RSC 里须放进 `"use client"` 边界，别在 server component 直接渲染。
- `startTime` 只在媒体首次可播放时 seek 一次且需 `>0`；运行中改它不会重新定位。
- `chapters` 的 tick 位置靠 `time/duration` 计算，`duration` 未知(0/NaN)时不渲染标记——海报态/未加载时看不到 tick 属正常。

## 相关
[Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md)
