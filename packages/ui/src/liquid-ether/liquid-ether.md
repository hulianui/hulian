---
slug: liquid-ether
name: LiquidEther
category: decoration
group: backdrop
tags: [animated, webgl]
exports: [LiquidEther]
status: enriched
---

# LiquidEther

> 液态色域 · 鼠标驱动的液态色域 WebGL 背景 · 域扭曲+metaball 翻涌 + 指针搅动/自动巡游(ogl·token·reduced-motion 降级) · decoration/backdrop · #animated #webgl

## 何时用

需要一层「跟手翻涌的液态色团」氛围背景（创意官网、产品 Hero、登录页）时用它，指针交互感最强。要规则点阵/网格选 [DotPattern](../dot-pattern/dot-pattern.md) / [GridPattern](../grid-pattern/grid-pattern.md)，要扫光聚焦选 [Spotlight](../spotlight/spotlight.md)；本组件是有机色域流体，色彩重量大，常配 `opacity` 压低做壁纸底。

## 导入
```ts
import { LiquidEther } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| colors | `string[]` | `["var(--color-chart-1)","var(--color-chart-2)","var(--color-chart-4)"]` | 调色板，至少 1 色（少于 2 会自动复制两端）；任意 CSS 颜色串，随明暗主题切换 |
| speed | `number` | `0.5` | 流动速度因子；建议 0.2-1.5 |
| scale | `number` | `1` | 液态团块尺度；越小越细碎越多团，越大越融合。建议 0.6-2 |
| mouseForce | `number` | `1` | 指针扰动强度；0=无视指针纯漂流。建议 0-2 |
| autoDemo | `boolean` | `true` | 无人交互时虚拟光标自动巡游搅动；关闭则静止待真实指针 |
| opacity | `number` | `1` | 整体不透明度 0-1；叠内容上常用 0.6-0.85 降视觉重量 |
| className | `string` | - | 透传到根容器（canvas 包裹层或 reduced fallback） |
| style | `CSSProperties` | - | 透传到根容器的内联样式 |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| fallback | `ReactNode` | reduced-motion / 无 WebGL 时的静态替代内容；默认多点 chart token radial-gradient 静态液面 |

## 示例

```tsx
// 默认：自动巡游的液态色域（父容器须 relative + overflow-hidden）
<div className="relative h-64 overflow-hidden rounded-xl">
  <LiquidEther />
</div>
```

```tsx
// 壁纸级：慢速 + 半透明叠底，内容叠在更高 z
<div className="relative h-64 overflow-hidden rounded-xl">
  <LiquidEther speed={0.3} scale={1.2} opacity={0.7} />
  <div className="pointer-events-none relative z-10 flex h-full items-center justify-center text-white">
    瑚琏组件库
  </div>
</div>
```

## 禁忌 / 坑

- 父容器须 `relative` + `overflow-hidden`，内容用 `relative z-10` 叠在上层；canvas 会满铺，叠加的文本建议加 `pointer-events-none` 避免吃掉指针搅动 [[webgl-canvas-rendered-but-invisible-negative-zindex-covered]]。
- WebGL 客户端组件（`"use client"`）；SSR 阶段只渲染 fallback，不会有 canvas。
- `colors` 传 `var(--color-…)` 时运行时经离屏 canvas 解析，**必须带 `--color-` 前缀**，裸 `var(--primary)` 解析不出 [[oklch-css-var-color-must-parse-via-offscreen-canvas]]。
- headless 截图常拍到静止/空白帧（rAF 动画被饿死），真机或 Playwright 实测才能看到流动 [[recharts-headless-screenshot-blank-clippath-animation-starved]]。

## 相关
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md)
