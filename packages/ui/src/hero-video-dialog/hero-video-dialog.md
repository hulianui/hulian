---
slug: hero-video-dialog
name: HeroVideoDialog
category: feedback
group: overlay
tags: []
exports: [HeroVideoDialog]
status: enriched
---

# HeroVideoDialog

> 点击封面缩略图，在模态浮层里播放视频 · feedback/overlay

## 何时用

落地页/营销页放一张视频缩略图 + 播放钮，点击后弹出 Portal 模态播放视频，支持 Esc/遮罩关闭并锁背景滚动。两种视频源都支持：第三方嵌入页（YouTube/Bilibili 的 embed 地址，走 iframe）与自托管视频文件（`.mp4`/`.webm` 等，走原生 `<video>`）。需要通用模态承载任意内容用 [Dialog](../dialog/dialog.md)；需要播放器全套控制（进度/倍速/PiP）或播 HLS 用 Video 播放器组件。

## 导入
```ts
import { HeroVideoDialog } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| thumbnailSrc* | `string` | - | 缩略图地址 |
| thumbnailAlt | `string` | - | 缩略图 alt 文本 |
| videoSrc* | `string` | - | 视频地址：embed 形态是 iframe 的 src（如 youtube/bilibili embed），video 形态是视频文件地址（`.mp4`/`.webm` 等） |
| videoType | `"auto" \| "embed" \| "video"` | `"auto"` | 弹层里用什么播。`"embed"` 挂 iframe，`"video"` 挂原生 `<video>`；`"auto"` 按 `videoSrc` 扩展名判别（`.mp4`/`.webm`/`.ogv`/`.ogg`/`.mov`/`.m4v` 走 `"video"`，其余走 `"embed"`） |
| className | `string` | - | 额外类名（控制缩略图尺寸等） |

## 示例
```tsx
// 自托管视频文件：auto 判别为 video，弹层里是原生播放器，缩略图自动当 poster
<HeroVideoDialog
  thumbnailSrc="/cover.jpg"
  thumbnailAlt="预览"
  videoSrc="/hero.mp4"
  className="w-80"
/>

// 第三方嵌入页：embed 地址没有视频扩展名，auto 判别为 embed，弹层里是 iframe
<HeroVideoDialog
  thumbnailSrc="/cover.jpg"
  thumbnailAlt="预览"
  videoSrc="https://www.youtube.com/embed/dQw4w9WgXcQ"
  className="w-80"
/>
```

## 禁忌 / 坑

- 用第三方平台时 `videoSrc` 必须是 **embed** 地址（`.../embed/...`），不是普通观看页 URL，否则模态内 iframe 加载失败。
- 自动判别只看扩展名。如果视频文件藏在没有扩展名的地址后面（`/api/video?id=1`、签名直链等），`"auto"` 会判成 embed 并挂上 iframe —— 浏览器自带的媒体查看器仍会把它放出来，画面正常但没有 poster、控件样式不受控，**光看页面不容易发现选错了**。这类地址请显式传 `videoType="video"`。
- 反过来，embed 地址里如果带 `.mp4` 之类的路径片段，`"auto"` 会误判成 video，请显式传 `videoType="embed"`。
- HLS（`.m3u8`）刻意不在自动判别范围内：只有 Safari 原生放得动，Chrome/Firefox 需要 hls.js。要放 HLS 用 Video 播放器组件，不要硬传 `videoType="video"`。
- `videoType="video"` 时弹层里的 `<video>` 带 `autoPlay`；若被浏览器的自动播放策略拦下，控件仍在，用户点一下即可播放。
- 缩略图尺寸靠 `className`（如 `w-80`）控制，组件本身不设固定宽度。

## 相关
[Dialog](../dialog/dialog.md) · [Modal](../modal/modal.md) · [AlertDialog](../alert-dialog/alert-dialog.md) · [Drawer](../drawer/drawer.md) · [Popover](../popover/popover.md) · [Tooltip](../tooltip/tooltip.md)
