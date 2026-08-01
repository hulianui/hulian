---
slug: ghost-cursor
name: GhostCursor
category: decoration
group: overlay-fx
tags: [animated]
exports: [GhostCursor]
status: enriched
---

# GhostCursor

> 幽灵拖尾光标 · 跟随指针的幽灵烟雾拖尾 · fbm 噪声烟团 + 环形帧缓冲历史尾迹 + 惯性滑行渐隐（ogl WebGL·去 three.js·reduced-motion 降级） · decoration/overlay-fx · #animated

## 何时用

作为覆盖整块区域的 WebGL 烟雾拖尾层，让指针在 hero/卡片/落地页上拖出发光烟团。要甩出具体图片做拖尾用 [ImageTrail](../image-trail/image-trail.md)；本组件是抽象烟雾光效，更适合纯氛围装饰。它是 `absolute inset-0` 覆盖层，父容器须 `relative` + 深色底才出效果。

## 导入
```ts
import { GhostCursor } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| trailLength | `number` | `32` | 拖尾保留的历史帧数，越大尾迹越长，片元开销线性增长，建议 16–64 |
| inertia | `number` | `0.5` | 惯性系数 0–1，越接近 1 越「飘」（拖远），越接近 0 越跟手 |
| grainIntensity | `number` | `0.05` | 胶片颗粒强度 0–0.3，叠加噪点；0 = 关闭 |
| brightness | `number` | `1.2` | 整体亮度增益，补偿去掉 Bloom 后的亮度损失，建议 0.8–2.0 |
| color | `string` | `var(--color-chart-1)` | 烟雾主色，吃明暗主题；任意 CSS 颜色串均可 |
| scale | `number` | `1` | 噪声活动半径系数 >0，越大烟团越弥散，越小越聚拢 |
| mixBlendMode | `CSSProperties["mixBlendMode"]` | `"screen"` | canvas 混合模式，深色底用 screen 叠加发光；浅色底可改 multiply/normal |
| className | `string` | — | 透传根容器（absolute inset-0）额外 className |
| style | `CSSProperties` | — | 透传根容器内联样式（如 zIndex） |

## 示例
```tsx
<div
  className="relative h-64 overflow-hidden rounded-xl"
  style={{ background: "oklch(0.14 0.02 285)" }}
>
  <GhostCursor />
</div>
```

暖橙长拖尾（高惯性）：
```tsx
<GhostCursor color="oklch(0.72 0.2 50)" trailLength={48} inertia={0.78} />
```

## 禁忌 / 坑

- WebGL（ogl）组件，React StrictMode 双挂载下若 cleanup 调 `loseContext` 会永久毒化 canvas 复用导致空白崩溃，本组件内部应每次挂载新建 canvas 规避，见 [[webgl-canvas-loseContext-poisons-strictmode-remount]]。
- 父容器必须 `relative` + `overflow-hidden` + 深色底（默认 screen 混合模式在浅色底几乎不可见）。
- SSR 下 WebGL 仅客户端可用，组件已带 reduced-motion 降级。

## 相关
[BorderBeam](../border-beam/border-beam.md) · [ShineBorder](../shine-border/shine-border.md) · [GlareHover](../glare-hover/glare-hover.md) · [Lens](../lens/lens.md) · [AnimatedBeam](../animated-beam/animated-beam.md) · [OrbitingCircles](../orbiting-circles/orbiting-circles.md)
