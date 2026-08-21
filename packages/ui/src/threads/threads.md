---
slug: threads
name: Threads
category: decoration
group: backdrop
tags: [animated, webgl]
exports: [Threads]
status: enriched
---

# Threads

> 流动丝线背景 · WebGL/ogl Perlin 波动线随鼠标摆动 + 透明底叠加 + chart token + 静态 fallback · decoration/backdrop · #animated #webgl

## 何时用

需要透明底上几条随鼠标摆动的流动丝线（极简科技感页眉/页脚/Hero 点缀）时用。基于 WebGL/ogl，透明底便于叠在任意背景之上；同为 WebGL 背景，[Silk](../silk/silk.md) 是满铺丝绸面、[Iridescence](../iridescence/iridescence.md) 是虹彩光谱面，本组件是稀疏丝线；不愿引入 WebGL 则用纯 CSS 的 [Aurora](../aurora/aurora.md)。

## 导入
```ts
import { Threads } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| color | `[number, number, number] \| string` | `--color-chart-1` | 丝线颜色。RGB 数组每分量 0-1（react-bits 原版格式），或任意 CSS 颜色字符串（hex/oklch/rgb/var）。不传则读主题 token |
| amplitude | number | 1 | 波动幅度，越大摆幅越剧烈，建议 0.3-3 |
| distance | number | 0 | 各丝线纵向间距缩放，正值拉开负值压缩，建议 -1-2 |
| enableMouseInteraction | boolean | true | 鼠标跟随：X 影响时间流速、Y 影响振幅，带 0.05 平滑插值 |
| className | string | - | 透传到 canvas（或 fallback div） |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| fallback | ReactNode | reduced-motion / 无 WebGL 时的静态替代（默认几条 CSS 渐变线）。传 `null` 可完全隐藏占位 |

## 示例
```tsx
// 默认深色底 chart-1 色，需 relative + overflow-hidden 父容器
<div className="relative h-56 overflow-hidden rounded-xl">
  <Threads />
</div>
```
```tsx
// 蓝色调（RGB 数组）+ 提高振幅
<Threads color={[0.22, 0.53, 0.96]} amplitude={1.2} />
```

## 禁忌 / 坑

- WebGL 组件，须客户端渲染；`color` 既收 0-1 的 `[r,g,b]` 数组也收 CSS 字符串（含 `var(--color-chart-3)`/oklch/hex）。
- ogl/WebGL 在 StrictMode 双挂载或 cleanup 时易踩 context 复用毒化坑——改源码时勿 cleanup 调 `loseContext` 后复用同一 canvas（参见 [[webgl-canvas-loseContext-poisons-strictmode-remount]]）；headless 无 WebGL 时走 fallback，视觉验证用真实浏览器。
- 透明底，需自行放在有底色的容器内才看得清；父容器须 `relative` + `overflow-hidden`。

## 相关
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md)
