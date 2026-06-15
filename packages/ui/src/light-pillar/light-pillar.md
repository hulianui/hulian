---
slug: light-pillar
name: LightPillar
category: decoration
group: backdrop
tags: [animated, webgl]
exports: [LightPillar]
status: enriched
---

# LightPillar

> 体积光柱 WebGL 背景 · 沿 y 轴 raymarch 累积辉光 + 多层波动噪声 + 顶底双色纵向渐变(ogl·token 自适应·reduced-motion 降级) · decoration/backdrop · #animated #webgl

## 何时用

需要单根顶底渐变的体积光柱做居中 hero 焦点时用。要随机闪烁的电弧/极光柱用 [Lightning](../lightning/lightning.md)；要放射状多束光用 [LightRays](../light-rays/light-rays.md)；要坠落光束用 [Lightfall](../lightfall/lightfall.md)。

## 导入
```ts
import { LightPillar } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| topColor | `string` | `var(--color-chart-2)` | 光柱顶部颜色，任意 CSS 颜色，默认 token 明暗自适应 |
| bottomColor | `string` | `var(--color-chart-1)` | 光柱底部颜色，与顶色沿 y 轴渐变混合 |
| intensity | `number` | `1` | 整体亮度系数，越大越亮 |
| rotationSpeed | `number` | `0.3` | 自转速度因子，同时驱动时间推进，0=几乎静止 |
| glowAmount | `number` | `0.005` | 辉光强度（raymarch 累积增益），建议 0.001–0.02 |
| pillarWidth | `number` | `3` | 光柱粗细（世界半径），越小越细如激光 |
| pillarHeight | `number` | `0.4` | 光柱高度系数，越大纵向条纹越密 |
| noiseIntensity | `number` | `0.5` | 颗粒噪声强度，0=纯净无颗粒 |
| pillarRotation | `number` | `0` | 光柱整体倾斜角度(度)，例 30=向一侧斜射 |
| className | `string` | — | 透传 canvas 容器(或 fallback div) |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| fallback | `ReactNode` | reduced-motion / 无 WebGL 时的静态替代内容，默认 token 渐变光柱 |

## 示例
```tsx
// token 双色，容器定高 + overflow-hidden
<div className="relative h-64 overflow-hidden rounded-xl">
  <LightPillar />
  <div className="relative z-10 flex h-full items-center justify-center">
    LightPillar
  </div>
</div>
```
```tsx
// 细激光：窄柱 · 高亮 · 无颗粒
<LightPillar pillarWidth={1.4} glowAmount={0.009} noiseIntensity={0} intensity={1.2} />
```

## 禁忌 / 坑

- ogl/WebGL 仅客户端；SSR / 无 WebGL 出 fallback（token 渐变），reduced-motion 下降级。
- `glowAmount` 量级很小（默认 0.005），调亮时小步加（如 0.009），数量级跳大会过曝。
- `topColor`/`bottomColor` 传 CSS 变量须用 `--color-` 前缀 token，见 [[hulian-token-color-var-needs-color-prefix]]。
- 全屏背景层在 opaque 背景的非层叠上下文父级里可能被父背景盖住，见 [[webgl-canvas-rendered-but-invisible-negative-zindex-covered]]。

## 相关
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md)
