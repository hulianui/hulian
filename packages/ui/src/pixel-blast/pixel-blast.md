---
slug: pixel-blast
name: PixelBlast
category: decoration
group: backdrop
tags: [animated, webgl]
exports: [PixelBlast, pixelBlastShowcase]
status: enriched
---

# PixelBlast

> 点阵翻涌 · 抖动点阵翻涌的 WebGL 背景 · FBM 噪声 + 8×8 Bayer 有序抖动量化成方块/圆/三角/菱形像素 + 四周渐隐（ogl·token·reduced-motion 降级静态点阵） · decoration/backdrop · #animated #webgl

## 何时用

需要一层「复古点阵 / 网点印刷」质感的氛围背景时用它，自带四周渐隐便于叠内容。要静态规则点阵选 [DotPattern](../dot-pattern/dot-pattern.md)，要 8-bit 复古网格透视选 [RetroGrid](../retro-grid/retro-grid.md)，要扫光聚焦选 [Spotlight](../spotlight/spotlight.md)；本组件是噪声驱动的动态点阵，有抖动颗粒感和翻涌运动。

## 导入
```ts
import { PixelBlast, pixelBlastShowcase } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| variant | `"square" \| "circle" \| "triangle" \| "diamond"` | `"square"` | 像素单元形状：方块（锐利复古）/ 圆点（网点印刷感）/ 三角（织纹）/ 菱形（菱形网点） |
| pixelSize | `number` | `4` | 单个像素方块边长（CSS px）；越小越密越细腻。建议 2–12 |
| color | `string` | `--color-primary` | 像素主色，CSS 颜色串；默认取 primary token 明暗自适应 |
| patternScale | `number` | `2` | 噪声纹理缩放；越大斑块越细碎闪烁越密。建议 0.5–6 |
| patternDensity | `number` | `1` | 像素填充密度；越大亮起像素越多越「满」。建议 0.4–1.6 |
| pixelSizeJitter | `number` | `0` | 每个方块尺寸的随机抖动幅度 0–1；越大越参差颗粒感越强 |
| speed | `number` | `0.5` | 动画速度因子；0=静止画面（仍渲一帧静态点阵） |
| edgeFade | `number` | `0.5` | 四周渐隐宽度 0–1（相对短边）；0=硬边铺满，越大四角越柔和 |
| className | `string` | — | 透传到根容器 div（或 reduced-motion 兜底 div） |
| style | `CSSProperties` | — | 透传到根容器的内联样式 |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| fallback | `ReactNode` | reduced-motion / 无 WebGL 时的静态替代内容；默认 primary token radial-gradient 点阵（CSS mask 模拟网点） |

## 示例

```tsx
// 默认：深底上 primary token 方块点阵（父容器须 relative）
<div className="relative h-64 overflow-hidden rounded-xl">
  <PixelBlast />
  <div className="relative z-10 flex h-full items-center justify-center">
    <p className="text-2xl font-bold text-white/90">PixelBlast</p>
  </div>
</div>
```

```tsx
// 圆点网点印刷感 + 加大像素
<PixelBlast variant="circle" pixelSize={6} />
```

## 禁忌 / 坑

- 组件自带 `absolute inset-0 z-0`，**父容器必须 `relative`，叠加内容用 `relative z-10`**，否则盖住内容 [[webgl-canvas-rendered-but-invisible-negative-zindex-covered]]。
- WebGL 客户端组件（`"use client"`）；SSR 阶段只渲染 fallback。
- `color` 传 `var(--color-…)` 时经离屏 canvas 解析，**须带 `--color-` 前缀**，裸 `var(--primary)` 解析失败 [[oklch-css-var-color-must-parse-via-offscreen-canvas]]。
- headless 截图常拍到静止/空白帧（rAF 动画被饿死），真机或 Playwright 实测才能看到翻涌 [[recharts-headless-screenshot-blank-clippath-animation-starved]]。

## 相关
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md)
