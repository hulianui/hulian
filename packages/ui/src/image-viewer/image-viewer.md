---
slug: image-viewer
name: ImageViewer
category: data-display
group: info
tags: []
exports: [ImageViewer]
status: enriched
---

# ImageViewer

> 图片查看器 · 全屏 Lightbox(portal+锁滚复用 dialog) · 受控 index 翻页(箭头/← →/序号) + 滚轮指针锚定缩放/双击 1x↔2x/拖拽平移(切图重置) + 底部缩略图条 + role=dialog aria-modal/Esc 关闭(仅渲当前图·零依赖) · data-display/info

## 何时用

需要点开缩略图进入「全屏看大图 + 翻页 + 缩放平移」时用——相册、工作照片、附件预览。只内联展示趋势小图用 [Sparkline]；展示商品卡用 [LiveProductCard]。ImageViewer 是全屏 Lightbox，受控 open/index，零依赖自带缩放平移。

## 导入
```ts
import { ImageViewer } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| open* | `boolean` | — | 受控开关 |
| images* | `ImageViewerImage[]` | — | 图片数组。`{src, alt?, caption?}` |
| index* | `number` | — | 受控当前页（组件不自管，翻页/点缩略图都回调出去） |
| className | `string` | — | 面板类名 |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onOpenChange* | `(open: boolean) => void` | 开关回调（Esc / 点遮罩 / 关闭按钮触发） |
| onIndexChange* | `(index: number) => void` | 翻页回调（箭头/← →/点缩略图触发） |

## 示例
```tsx
const [open, setOpen] = useState(false);
const [index, setIndex] = useState(0);

<ImageViewer
  open={open}
  onOpenChange={setOpen}
  images={[
    { src: "/a.jpg", alt: "A", caption: "说明" },
    { src: "/b.jpg", alt: "B" },
  ]}
  index={index}
  onIndexChange={setIndex}
/>
```

## 禁忌 / 坑

- 全受控：open 与 index 都由外部持有，组件不自管当前页——翻页/点缩略图通过 `onIndexChange` 回调，必须 setState 才会动。
- 缩放/平移是「视图态」，切图（index 变）和开关（open 变）时组件内部自动归零；不要在外部缓存 scale/offset 想跨图保留。
- 只渲染当前 index 的大图（缩略图条用小尺寸 src），images 很多也不卡；打开前记得把 index 复位到目标图。

## 相关
[Sparkline](../sparkline/sparkline.md) · [LiveProductCard](../live-product-card/live-product-card.md) · [DiffStat](../diff-stat/diff-stat.md) · [ScoreRing](../score-ring/score-ring.md) · [Badge](../badge/badge.md) · [Dot](../dot/dot.md)
