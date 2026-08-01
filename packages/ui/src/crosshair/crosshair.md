---
slug: crosshair
name: Crosshair
category: decoration
group: overlay-fx
tags: [animated]
exports: [Crosshair]
status: enriched
---

# Crosshair

> 准星十字线 · 鼠标跟随的容器内准星十字线 · lerp 平滑拖尾 + 进入抖动脉冲 + token 配色(零依赖·reduced-motion) · decoration/overlay-fx · #animated

## 何时用

需要在某区域内显示跟随鼠标的准星十字线（瞄准/取景/技术风互动区）时用。它是十字准星；要光标果冻拖尾用 [BlobCursor](../blob-cursor/blob-cursor.md)，要点击迸发火花用 [ClickSpark](../click-spark/click-spark.md)，要满屏粒子吸附背景用 [Antigravity](../antigravity/antigravity.md)。

## 导入
```ts
import { Crosshair } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| color | `string` | `var(--color-primary)` | 准星十字线颜色（自动吃明暗主题），推荐用 token |
| smoothing | `number` | `0.15` | 跟随平滑系数（0–1），越小越黏越拖尾，越大越跟手 |
| thickness | `number` | `1` | 十字线粗细（px） |
| pulseOnEnter | `boolean` | `true` | 进入容器时触发一次抖动脉冲（CSS scale）；reduced-motion 下失效，跟随仍保留 |
| className | `string` | — | 透传到根容器（须为定位上下文，组件内部 absolute inset-0 铺满父级） |
| style | `CSSProperties` | — | 透传到根容器内联样式 |

## 示例
```tsx
// 默认：primary 准星
<div className="relative h-56 overflow-hidden rounded-xl">
  <Crosshair />
</div>

// 高黏滞拖尾 + token 色
<Crosshair smoothing={0.06} color="var(--color-chart-3)" />
```

## 禁忌 / 坑

- 父容器须为定位上下文且有明确高度：组件内部以 `absolute inset-0` 铺满父级，无定位/无高度则准星不可见。
- `color` 用 token 推荐带 `--color-` 前缀（`var(--color-primary)`）以确保解析。见 [[hulian-token-color-var-needs-color-prefix]]。
- reduced-motion 下进入脉冲失效，但鼠标跟随仍保留。

## 相关
[BorderBeam](../border-beam/border-beam.md) · [ShineBorder](../shine-border/shine-border.md) · [GlareHover](../glare-hover/glare-hover.md) · [Lens](../lens/lens.md) · [AnimatedBeam](../animated-beam/animated-beam.md) · [OrbitingCircles](../orbiting-circles/orbiting-circles.md)
