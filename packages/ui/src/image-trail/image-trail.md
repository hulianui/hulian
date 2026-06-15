---
slug: image-trail
name: ImageTrail
category: decoration
group: overlay-fx
tags: [animated]
exports: [ImageTrail]
status: enriched
---

# ImageTrail

> 光标拖尾图片组件 · 移动光标沿轨迹依次甩出图片淡入跟随、缩小淡出(零依赖 RAF+lerp·token·reduced-motion) · decoration/overlay-fx · #animated

## 何时用

让光标在区域内移动时沿轨迹依次甩出一串具体图片（作品缩略图、产品图）做拖尾，常用于作品集/落地页 hero。要抽象烟雾光效而非真实图片用 [GhostCursor](../ghost-cursor/ghost-cursor.md)。根容器自带 `relative + overflow-hidden` 捕获层，传 `images` 是必填。

## 导入
```ts
import { ImageTrail } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| images* | `string[]` | — | 拖尾依次出现的图片 URL 列表（循环复用）；至少 1 张，建议 6–12 张 |
| threshold | `number` | `80` | 光标累计位移触发下一张图的阈值（px），越小越密集越频繁 |
| imageWidth | `number` | `190` | 单张图片宽度（px），高度按 1.1 宽高比自动派生 |
| followStrength | `number` | `0.5` | 跟随插值系数 0–1，越大跟手越紧，越小越黏滞 |
| fadeDuration | `number` | `0.8` | 单张图从出现到淡出消失的时长（秒） |
| className | `string` | — | 透传根容器（relative+overflow-hidden 捕获层）额外 className |
| style | `CSSProperties` | — | 透传根容器内联样式 |
| children | `ReactNode` | — | 覆盖在拖尾层之上的内容（如标题文案） |

## 示例
```tsx
<div
  className="relative h-72 overflow-hidden rounded-xl"
  style={{ background: "oklch(0.16 0.02 255)" }}
>
  <ImageTrail images={IMAGES} className="border-0 bg-transparent" />
</div>
```

稀疏大图、慢淡出：
```tsx
<ImageTrail images={IMAGES} threshold={140} imageWidth={240} fadeDuration={1.2} />
```

## 禁忌 / 坑

- `images` 必填且至少 1 张，空数组没有任何拖尾。
- 远程图片受门禁限制（禁外链），库内 showcase 用内联 SVG data URI 占位；接入时请用本地/同源资源。
- 根容器需要明确高度 + `overflow-hidden`，否则甩出的图片会溢出容器。

## 相关
[BorderBeam](../border-beam/border-beam.md) · [ShineBorder](../shine-border/shine-border.md) · [GlareHover](../glare-hover/glare-hover.md) · [Lens](../lens/lens.md) · [AnimatedBeam](../animated-beam/animated-beam.md) · [OrbitingCircles](../orbiting-circles/orbiting-circles.md)
