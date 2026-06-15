---
slug: progressive-blur
name: ProgressiveBlur
category: decoration
group: overlay-fx
tags: []
exports: [ProgressiveBlur]
status: enriched
---

# ProgressiveBlur

> 渐进模糊 · 分层 backdrop-blur + mask 渐变(纯 CSS·RSC) · decoration/overlay-fx

## 何时用

需要把内容某一侧（图片墙、长列表、横向滚动条）逐渐模糊淡出做边缘羽化时用，常铺在滚动容器或图片上方做「渐隐遮罩」。它只做单侧渐进模糊叠层；要给边框走光用 [BorderBeam](../border-beam/border-beam.md)/[ShineBorder](../shine-border/shine-border.md)，要做鼠标跟随聚光用 [GlareHover](../glare-hover/glare-hover.md)，要做局部放大镜用 [Lens](../lens/lens.md)。

## 导入
```ts
import { ProgressiveBlur } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| side | `"top" \| "bottom" \| "left" \| "right"` | `"bottom"` | 模糊增强的方向，该侧最糊。 |
| layers | `number` | — | 分层数，越多过渡越平滑。 |
| blur | `number` | — | 基础模糊量(px)，逐层翻倍。 |
| className | `string` | — | 透传到根叠层。 |

## 示例
```tsx
<div className="relative overflow-hidden">
  {/* content */}
  <ProgressiveBlur side="bottom" />
</div>
```

## 禁忌 / 坑

- 父容器必须 `position: relative` 且 `overflow-hidden`，叠层靠绝对定位铺满该侧，否则模糊层会溢出或定位错乱。
- 依赖 `backdrop-filter`，需作用在有实际内容的同层之上才看得见效果（空背景上无可糊之物）。

## 相关
[BorderBeam](../border-beam/border-beam.md) · [ShineBorder](../shine-border/shine-border.md) · [GlareHover](../glare-hover/glare-hover.md) · [Lens](../lens/lens.md) · [AnimatedBeam](../animated-beam/animated-beam.md) · [OrbitingCircles](../orbiting-circles/orbiting-circles.md)
