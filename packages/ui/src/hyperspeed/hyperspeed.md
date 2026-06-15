---
slug: hyperspeed
name: Hyperspeed
category: decoration
group: backdrop
tags: [animated, webgl]
exports: [Hyperspeed]
status: enriched
---

# Hyperspeed

> 超空间跃迁 warp 隧道背景 · 从消失点放射的双色车灯光带向观察者冲来 + 湍流扭曲 + 程序化辉光(ogl 单 shader·零新依赖·token·reduced-motion 静态降级) · decoration/backdrop · #animated #webgl

## 何时用

需要强冲击的 warp 隧道 / 跃迁速度感 hero 背景时用。要纯几何透视网格（无运动隧道）用 [RetroGrid](../retro-grid/retro-grid.md)；只要低调网格底纹用 [GridPattern](../grid-pattern/grid-pattern.md)。

## 导入
```ts
import { Hyperspeed } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| speed | `number` | `1` | 整体推进速度倍率，越大冲来越快，建议 0.2–4 |
| density | `number` | `40` | 道路两侧光带密度，越大越密集，建议 10–120 |
| distortion | `number` | `1` | 视野扭曲强度（湍流摆动），0=笔直隧道，建议 0–2 |
| fade | `number` | `0.4` | 雾化淡出强度，越大远处越快被黑暗吞没，建议 0–1 |
| leftColor | `string` | `var(--color-chart-4)` | 左侧（驶离）车灯色，任意 CSS 颜色 |
| rightColor | `string` | `var(--color-chart-2)` | 右侧（驶近）车灯色，任意 CSS 颜色 |
| className | `string` | — | 透传根容器（本身 block h-full w-full，由容器控尺寸） |
| fallback | `ReactNode` | — | reduced-motion / 无 WebGL 时渲染在静态兜底层内的内容 |
| style | `CSSProperties` | — | 透传根容器内联样式 |

## 示例
```tsx
// warp 隧道需深色底显辉光，容器定高 + overflow-hidden
<div className="relative h-64 overflow-hidden rounded-xl bg-black">
  <Hyperspeed className="absolute inset-0" />
</div>
```
```tsx
// 踩满油门：高速密集
<Hyperspeed speed={3} density={90} className="absolute inset-0" />
```

## 禁忌 / 坑

- 深色底才显辉光，浅色容器上几乎不可见，建议配 `bg-black` 或深色底。
- ogl 单 shader 仅客户端渲染；SSR / 无 WebGL 出 fallback 静态层，reduced-motion 下也降级。
- 全屏背景层在 opaque 背景的非层叠上下文父级里可能被父背景盖住，见 [[webgl-canvas-rendered-but-invisible-negative-zindex-covered]]。
- `leftColor`/`rightColor` 传 CSS 变量须用 `--color-` 前缀 token，见 [[hulian-token-color-var-needs-color-prefix]]。

## 相关
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md)
