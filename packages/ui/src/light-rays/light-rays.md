---
slug: light-rays
name: LightRays
category: decoration
group: backdrop
tags: [animated, webgl]
exports: [LightRays]
status: enriched
---

# LightRays

> 光束放射 · 体积光束放射 WebGL 背景 · 八向原点 + 双层正弦扰动/扩散衰减/脉动/噪点/扭曲 + 鼠标方向跟随(ogl·token 着色·reduced-motion 静态渐变兜底) · decoration/backdrop · #animated #webgl

## 何时用

需要自某个原点（八向可选）放射的体积光束做 hero 背景、且可跟随鼠标偏转时用。要单根体积光柱用 [LightPillar](../light-pillar/light-pillar.md)；要坠落光束用 [Lightfall](../lightfall/lightfall.md)；要随机闪烁电弧用 [Lightning](../lightning/lightning.md)。

## 导入
```ts
import { LightRays } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| raysOrigin | `"top-center" \| "top-left" \| "top-right" \| "left" \| "right" \| "bottom-left" \| "bottom-center" \| "bottom-right"` | `"top-center"` | 光束发射原点，决定锚点与传播方向（四角 / 四边中点） |
| raysColor | `string` | `var(--color-chart-1)` | 光束颜色，任意 CSS 颜色，离屏 canvas 解析为 RGB |
| raysSpeed | `number` | `1` | 闪烁/律动速度倍率，0 近乎静止（仍渲染一帧） |
| lightSpread | `number` | `1` | 光束扩散角度，越大越散、越小越聚拢，建议 0.3-3 |
| rayLength | `number` | `2` | 光束长度（相对视口宽倍数） |
| pulsating | `boolean` | `false` | 整体亮度随时间正弦呼吸 |
| fadeDistance | `number` | `1` | 沿程渐隐距离（相对视口宽倍数），越小越快淡出 |
| saturation | `number` | `1` | 饱和度，<1 去色趋灰，0=纯灰阶 |
| followMouse | `boolean` | `true` | 光束方向跟随鼠标（需 mouseInfluence>0 才有可见偏转） |
| mouseInfluence | `number` | `0.1` | 鼠标对方向的影响权重(0-1)，0=不偏转 |
| noiseAmount | `number` | `0` | 颗粒噪声强度(0-1) |
| distortion | `number` | `0` | 角度扭曲强度，让光束摇曳而非笔直，建议 0-1 |
| className | `string` | - | 透传根容器（自带 pointer-events-none absolute inset-0 z-0） |
| style | `CSSProperties` | - | 透传根容器内联样式 |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| children | `ReactNode` | 叠在光束层之上的内容，WebGL 与降级两路径均渲染 |
| fallback | `ReactNode` | reduced-motion / 无 WebGL 时叠在静态渐变上的兜底内容 |

## 示例
```tsx
// 自带 absolute inset-0，容器 relative + 定高 + overflow-hidden
<div className="relative h-64 overflow-hidden rounded-xl">
  <LightRays raysOrigin="top-center" className="opacity-90" />
  <div className="relative z-10 flex h-full items-center justify-center">
    LightRays
  </div>
</div>
```
```tsx
// 左侧射入 · 暖色 · 聚拢窄束
<LightRays raysOrigin="left" raysColor="oklch(0.78 0.16 70)" lightSpread={0.8} />
```

## 禁忌 / 坑

- 组件自带 `pointer-events-none absolute inset-0 z-0`，叠加内容须 `relative z-10` 才在它之上。
- `followMouse` 默认 true，但需 `mouseInfluence>0`（默认 0.1）才有可见偏转；想完全静止设 `mouseInfluence={0}`。
- ogl/WebGL 仅客户端；SSR / 无 WebGL 出静态渐变兜底，reduced-motion 下降级。`children` 两路径都渲染以保 DOM 一致。
- `raysColor` 传 CSS 变量须用 `--color-` 前缀 token，见 [[hulian-token-color-var-needs-color-prefix]]。
- 全屏背景层在 opaque 背景的非层叠上下文父级里可能被父背景盖住，见 [[webgl-canvas-rendered-but-invisible-negative-zindex-covered]]。

## 相关
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md)
