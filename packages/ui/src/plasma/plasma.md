---
slug: plasma
name: Plasma
category: decoration
group: backdrop
tags: [animated, webgl]
exports: [Plasma]
status: enriched
---

# Plasma

> 等离子流动 WebGL 背景 · 60 步光线步进 shader + 鼠标扰动 + forward/reverse/pingpong 三向(ogl·token 染色·reduced-motion 降级) · decoration/backdrop · #animated #webgl

## 何时用

需要一层「等离子能量流动 / 中心发光」氛围背景时用它，单色染色简洁、运动方向可控。要双丝带交织的复杂波带选 [PlasmaWave](../plasma-wave/plasma-wave.md)，要液态色团翻涌选 [LiquidEther](../liquid-ether/liquid-ether.md)，要点阵几何选 [DotPattern](../dot-pattern/dot-pattern.md)；本组件是最克制的单色等离子流，适合做品牌强调色铺底。

## 导入
```ts
import { Plasma } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| color | `string` | `--color-chart-1` | 等离子主色，CSS 颜色串；默认取 chart token；传 `null`/解析失败退回 shader 原生彩色（不染色） |
| speed | `number` | `1` | 流动速度因子（内部乘 0.4 喂 shader 与原版对齐）；越大越快 |
| direction | `"forward" \| "reverse" \| "pingpong"` | `"forward"` | 流动方向：向上涌 / 反向下沉 / 正反平滑往复（smoothstep 缓动） |
| scale | `number` | `1` | 视场缩放；越大画面越「拉近」纹理越大，越小越密 |
| opacity | `number` | `1` | 整体不透明度 0–1（叠在 shader alpha 上）；作柔和背景时压暗用 |
| mouseInteractive | `boolean` | `true` | 指针轻微扭曲等离子流场；关闭后纯自动且不挂 mousemove 监听 |
| className | `string` | — | 透传到 root（canvas 容器或 fallback div） |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| fallback | `ReactNode` | reduced-motion / 无 WebGL 时的静态替代内容；默认 chart token 径向渐变（保留中心发光观感） |

## 示例

```tsx
// 默认：主题色等离子流（父容器须 relative + overflow-hidden）
<div className="relative h-56 overflow-hidden rounded-xl">
  <Plasma />
</div>
```

```tsx
// 压暗背景 + 关交互，内容叠更高 z
<div className="relative h-56 overflow-hidden rounded-xl">
  <Plasma opacity={0.5} mouseInteractive={false} scale={1.3} />
  <div className="relative z-10 flex h-full items-center justify-center text-white">瑚琏组件库</div>
</div>
```

## 禁忌 / 坑

- 组件满铺画布，**父容器须 `relative` + `overflow-hidden`，叠加内容用 `relative z-10`**，否则盖住内容 [[webgl-canvas-rendered-but-invisible-negative-zindex-covered]]。
- WebGL 客户端组件（`"use client"`）；SSR 阶段只渲染 fallback。
- `color` 传 `var(--color-…)` 时经离屏 canvas 解析，**须带 `--color-` 前缀**，裸 `var(--primary)` 解析失败会退回原生彩色而非你想要的主题色 [[oklch-css-var-color-must-parse-via-offscreen-canvas]]。
- headless 截图常拍到静止/空白帧（rAF 动画被饿死），真机或 Playwright 实测才能看到流动 [[recharts-headless-screenshot-blank-clippath-animation-starved]]。

## 相关
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md)
