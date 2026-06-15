---
slug: prismatic-burst
name: PrismaticBurst
category: decoration
group: backdrop
tags: [animated, webgl]
exports: [PrismaticBurst]
status: enriched
---

# PrismaticBurst

> 棱镜光爆 WebGL 背景 · 从中心放射的体积步进光谱射线(可弯曲扭曲/N 瓣梳理/三维翻滚/hover 跟随) · 默认色带吃 --color-chart-1..5 token(明暗自适应) + 懒加载 ogl 复用 useGlCanvas(StrictMode 安全·reduced-motion 降级静态径向光爆) · decoration/backdrop · #animated #webgl

## 何时用

需要一个「从中心爆发的光谱射线」作为强视觉焦点（产品发布页、活动 Hero）时用它，放射感和色谱跨度最大。要单体棱锥分光选 [Prism](../prism/prism.md)，要满铺流动纹理选 [Plasma](../plasma/plasma.md) / [PlasmaWave](../plasma-wave/plasma-wave.md)；本组件是中心放射光爆，可调瓣数做六芒星/星爆，叠加底图常配 `mixBlendMode`。

## 导入
```ts
import { PrismaticBurst } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| intensity | `number` | `2` | 整体亮度增益（直接乘最终颜色）；0=全黑 |
| speed | `number` | `1` | 体积步进动画速度因子；越大翻涌越快 |
| animationType | `"rotate" \| "rotate3d" \| "hover"` | `"rotate"` | rotate=单轴平面旋转（最克制）/ rotate3d=三维欧拉旋转 / hover=跟随指针倾斜 |
| colors | `string[]` | `--color-chart-1..5` | 色带（烘焙成一维渐变纹理按 march 进度采样）；任意 CSS 颜色串，默认 chart token 明暗自适应 |
| distort | `number` | `0` | 光线弯曲扭曲量 0–50（shader 内夹紧）；越大射线越像被引力透镜扭弯 |
| noiseAmount | `number` | `0` | 颗粒抖动噪声量 0–1；弱化条带感 |
| rayCount | `number` | `0` | 放射光束瓣数；0=连续光晕，>0 按角度梳理 N 条对称射线（6=六芒星） |
| offset | `{ x?: number; y?: number }` | `{ x: 0, y: 0 }` | 爆发中心相对画面中心的偏移（CSS 像素），x 正向右、y 正向下 |
| mixBlendMode | `string` | `"none"` | 透传到 canvas 的 `mix-blend-mode`；常用 "lighten" / "screen" 叠底更通透 |
| className | `string` | — | 合并到 root 容器（或 reduced 降级 div） |
| fallback | `ReactNode` | chart token 径向光爆渐变 | reduced-motion / 无 WebGL 时的静态替代内容 |

## 示例

```tsx
// 默认：连续光晕 + token 光谱（父容器须 relative + overflow-hidden）
<div className="relative h-56 overflow-hidden rounded-xl">
  <PrismaticBurst className="opacity-90" />
  <div className="absolute inset-0 flex items-center justify-center text-white/80">PrismaticBurst</div>
</div>
```

```tsx
// 六瓣星爆 + 提亮
<PrismaticBurst rayCount={6} intensity={2.4} className="opacity-95" />
```

## 禁忌 / 坑

- 组件满铺画布，**父容器须 `relative` + `overflow-hidden`，叠加内容用 `absolute inset-0` / `relative z-10`**，否则盖住内容 [[webgl-canvas-rendered-but-invisible-negative-zindex-covered]]。
- WebGL 客户端组件（`"use client"`），ogl 懒加载、复用 useGlCanvas 对 React StrictMode 双挂载安全；SSR 阶段只渲染 fallback。
- `colors` 传 `var(--color-…)` 时经离屏 canvas 解析，**须带 `--color-` 前缀**，裸 `var(--primary)` 解析失败 [[oklch-css-var-color-must-parse-via-offscreen-canvas]]。
- headless 截图常拍到静止/空白帧（rAF 动画被饿死），真机或 Playwright 实测才能看到爆发 [[recharts-headless-screenshot-blank-clippath-animation-starved]]。

## 相关
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md)
