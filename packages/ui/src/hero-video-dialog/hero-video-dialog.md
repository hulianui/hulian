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

> 视频弹层 · 缩略图+播放钮→Portal 模态(Esc/遮罩关 + 锁滚) · feedback/overlay

## 何时用

落地页/营销页放一张视频缩略图 + 播放钮，点击后弹出 Portal 模态播放嵌入视频（YouTube/Bilibili embed），支持 Esc/遮罩关闭并锁背景滚动。需要通用模态承载任意内容用 [Dialog](../dialog/dialog.md)；需要原生播放器全套控制（进度/倍速/PiP）用 Video 播放器组件。

## 导入
```ts
import { HeroVideoDialog } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| thumbnailSrc* | `string` | — | 缩略图地址 |
| thumbnailAlt | `string` | — | 缩略图 alt 文本 |
| videoSrc* | `string` | — | 视频嵌入地址（iframe src，如 youtube/bilibili embed） |
| className | `string` | — | 额外类名（控制缩略图尺寸等） |

## 示例
```tsx
<HeroVideoDialog
  thumbnailSrc="/cover.jpg"
  thumbnailAlt="预览"
  videoSrc="https://www.youtube.com/embed/dQw4w9WgXcQ"
  className="w-80"
/>
```

## 禁忌 / 坑

- `videoSrc` 必须是 iframe **embed** 地址（`.../embed/...`），不是普通观看页 URL，否则模态内 iframe 加载失败。
- 缩略图尺寸靠 `className`（如 `w-80`）控制，组件本身不设固定宽度。

## 相关
[Dialog](../dialog/dialog.md) · [Modal](../modal/modal.md) · [AlertDialog](../alert-dialog/alert-dialog.md) · [Drawer](../drawer/drawer.md) · [Popover](../popover/popover.md) · [Tooltip](../tooltip/tooltip.md)
