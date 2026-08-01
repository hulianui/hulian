---
slug: gradual-blur
name: GradualBlur
category: decoration
group: overlay-fx
tags: [animated]
exports: [GradualBlur]
status: enriched
---

# GradualBlur

> 渐进贴边模糊 · 沿容器某一边叠加多层 backdrop-filter 的渐进式模糊贴边 · 八方向/曲线/指数递增 + 悬停增强 + 进场淡入(零依赖·tokens·reduced-motion) · decoration/overlay-fx · #animated

## 何时用

给滚动容器/图片墙某一边贴一条渐进模糊条，把贴边内容柔化淡出（常做长列表底部/顶部的「渐隐遮罩」）。它靠 `backdrop-filter` 模糊下层真实内容，不绘制自身像素；要纯装饰的边框流光用 [BorderBeam](../border-beam/border-beam.md) 这类组件。父容器须 `relative` 定位。

## 导入
```ts
import { GradualBlur } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| position | `"top"｜"bottom"｜"left"｜"right"` | `"bottom"` | 模糊条贴靠的边；top/bottom 为横条，left/right 为竖条 |
| strength | `number` | `2` | 模糊强度基数，每层按曲线递增，建议 1–6 |
| height | `string` | `"6rem"` | 横条厚度；竖条模式下若没传 width 则复用此值作竖条宽度 |
| width | `string` | — | 竖条（left/right）宽度，缺省回落到 `height` |
| divCount | `number` | `5` | 叠加模糊层数，越多过渡越细腻、越费性能，建议 3–10 |
| exponential | `boolean` | `false` | 指数级递增模糊量（近边缘急剧变糊），false=线性 |
| curve | `"linear"｜"bezier"｜"ease-in"｜"ease-out"｜"ease-in-out"` | `"linear"` | 每层模糊量沿进度的爬升曲线 |
| opacity | `number` | `1` | 整体不透明度 |
| hoverIntensity | `number` | — | 悬停时模糊放大倍数；传入即启用并接管指针事件（pointer-events:auto），不传则容器穿透不挡交互 |
| revealOnScroll | `boolean` | `false` | 进入视口时淡入（IntersectionObserver 驱动），开启后默认不可见 |
| duration | `string` | `"0.3s"` | 淡入过渡时长，仅 `revealOnScroll` 时生效 |
| zIndex | `number` | `10` | 叠加的 z-index |
| className | `string` | — | 透传根容器额外 className |
| style | `CSSProperties` | — | 透传根容器内联样式（与内部计算样式合并，同名以此为准） |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| children | `ReactNode` | 覆盖在模糊层之上的内容（如贴边标题/操作条） |

## 示例
```tsx
<div className="relative h-64 overflow-hidden rounded-xl bg-surface">
  {/* ...滚动内容... */}
  <GradualBlur position="bottom" height="7rem" />
</div>
```

顶部强模糊、指数递增：
```tsx
<GradualBlur position="top" height="8rem" strength={4} divCount={8} exponential />
```

## 禁忌 / 坑

- 靠 `backdrop-filter` 工作：若祖先元素自身带了 `filter` / `backdrop-filter` / `transform`，会创建新的包含块，模糊层的 fixed/绝对定位可能错位失效，见 [[backdrop-filter-ancestor-breaks-fixed-overlay-centering]]。
- 不传 `hoverIntensity` 时容器 `pointer-events:none` 不挡下层交互；一旦传入会接管指针事件，注意别遮住可点内容。
- 不传 `width` 时竖条宽度复用 `height` 值，这是有意设计，别误以为是 bug。

## 相关
[BorderBeam](../border-beam/border-beam.md) · [ShineBorder](../shine-border/shine-border.md) · [GlareHover](../glare-hover/glare-hover.md) · [Lens](../lens/lens.md) · [AnimatedBeam](../animated-beam/animated-beam.md) · [OrbitingCircles](../orbiting-circles/orbiting-circles.md)
