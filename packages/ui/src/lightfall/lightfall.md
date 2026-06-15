---
slug: lightfall
name: Lightfall
category: decoration
group: backdrop
tags: [animated, webgl]
exports: [Lightfall]
status: enriched
---

# Lightfall

> 隧道光束坠落 WebGL 背景 · 多色光束按高度循环取色 + 中心辉光 + 闪烁/拖尾 + 鼠标牵引(ogl·token·reduced-motion 降级) · decoration/backdrop · #animated #webgl

## 何时用

需要深色 hero 上多色光束坠落、带中心辉光与拖尾的氛围背景时用。要放射状光束（自原点向外）用 [LightRays](../light-rays/light-rays.md)；要单根体积光柱用 [LightPillar](../light-pillar/light-pillar.md)；只要静态点阵底纹用 [DotPattern](../dot-pattern/dot-pattern.md)。

## 导入
```ts
import { Lightfall } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| colors | `string[]` | `["var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-4)"]` | 光束色板（按高度循环），任意 CSS 颜色，最多取前 8 个 |
| backgroundColor | `string` | `var(--color-primary)` | 背景中心辉光底色 |
| speed | `number` | `0.5` | 坠落速度，0 近似静止（仍渲染） |
| streakCount | `number` | `2` | 同时坠落的光束条数（1–16，四舍五入夹取） |
| streakWidth | `number` | `1` | 单束横向宽度系数，越大越粗 |
| streakLength | `number` | `1` | 单束拖尾长度系数，越大尾迹越长 |
| glow | `number` | `1` | 整体辉光强度 |
| density | `number` | `0.6` | 光束角向疏密（环数），越大越密集 |
| twinkle | `number` | `1` | 闪烁强度，0=常亮，1=明暗呼吸 |
| zoom | `number` | `3` | 视距缩放（隧道纵深感） |
| backgroundGlow | `number` | `0.5` | 背景中心辉光强度，0=关闭 |
| opacity | `number` | `1` | 整体不透明度（写入 shader） |
| mouseInteraction | `boolean` | `true` | 鼠标交互（指针增亮 + 牵引光团） |
| mouseStrength | `number` | `0.5` | 鼠标增亮强度 |
| mouseRadius | `number` | `1` | 鼠标影响半径 |
| className | `string` | — | 透传根容器（组件自带 absolute inset-0 z-0） |
| fallback | `ReactNode` | — | reduced-motion / 无 WebGL 时的静态兜底内容 |

## 示例
```tsx
// 组件自带 absolute inset-0，容器只需 relative + 定高 + overflow-hidden
<div className="relative h-64 overflow-hidden rounded-xl">
  <Lightfall />
  <div className="relative z-10 flex h-full items-center justify-center">
    Lightfall
  </div>
</div>
```
```tsx
// 缓慢壁纸级：长拖尾 · 无交互
<Lightfall speed={0.25} streakCount={3} streakLength={1.8} mouseInteraction={false} />
```

## 禁忌 / 坑

- 组件自带 `absolute inset-0 z-0`，叠在它上面的内容须 `relative z-10`，否则被盖住。
- ogl/WebGL 仅客户端；SSR / 无 WebGL 出 fallback，reduced-motion 下降级。
- 全屏背景层在 opaque 背景的非层叠上下文父级里可能被父背景盖成全黑，见 [[webgl-canvas-rendered-but-invisible-negative-zindex-covered]]。
- `colors`/`backgroundColor` 传 CSS 变量须用 `--color-` 前缀 token，见 [[hulian-token-color-var-needs-color-prefix]]。

## 相关
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md)
