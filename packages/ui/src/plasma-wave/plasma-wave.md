---
slug: plasma-wave
name: PlasmaWave
category: decoration
group: backdrop
tags: [animated, webgl]
exports: [PlasmaWave]
status: enriched
---

# PlasmaWave

> 等离子波 WebGL 背景 · raymarch 双丝带交织流动 + 双色权重混合(ogl·主题感知 chart token·reduced-motion 静态渐变降级) · decoration/backdrop · #animated #webgl

## 何时用

需要一层「双色丝带交织流动」的高级氛围背景（Hero、品牌页）时用它，双流速 + 弯曲 + 旋转可调出丰富波带构图。要单色克制的等离子流选 [Plasma](../plasma/plasma.md)，要液态色团翻涌选 [LiquidEther](../liquid-ether/liquid-ether.md)，要点阵几何选 [DotPattern](../dot-pattern/dot-pattern.md)；本组件是双丝带交织，节奏更复杂、视觉更绵密。

## 导入
```ts
import { PlasmaWave } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| colors | `string[]` | `["var(--color-chart-1)","var(--color-chart-2)"]` | 双色，任意 CSS 颜色串；只取前两色（uColor1/uColor2），多传忽略；随明暗主题切换 |
| xOffset | `number` | `0` | 丝带水平偏移（设备像素），让波纹焦点离开正中 |
| yOffset | `number` | `0` | 丝带垂直偏移（设备像素） |
| rotationDeg | `number` | `0` | 整体旋转角度（度），把横向波带斜向铺排更有张力 |
| focalLength | `number` | `0.8` | 焦距（视线收束）；越大越聚拢纵深越强，越小越铺展。建议 0.4–1.6 |
| speed1 | `number` | `0.05` | 第一条丝带流速；越大越快 |
| speed2 | `number` | `0.05` | 第二条丝带流速 |
| dir2 | `number` | `1` | 第二条丝带流向（+1 同向 / -1 反向），与第一条对冲产生交织感 |
| bend1 | `number` | `1` | 第一条丝带弯曲幅度；越大起伏越夸张 |
| bend2 | `number` | `0.5` | 第二条丝带弯曲幅度 |
| className | `string` | — | 透传到 canvas 容器或 fallback div；常用于尺寸/圆角/opacity（如 `absolute inset-0 opacity-80`） |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| fallback | `ReactNode` | reduced-motion / 无 WebGL 时的静态替代内容；覆盖在静态渐变之上 |

## 示例

```tsx
// 默认：chart token 双色波带（须自带 absolute inset-0 铺满 relative 父容器）
<div className="relative h-56 overflow-hidden rounded-xl">
  <PlasmaWave className="absolute inset-0" />
  <div className="absolute inset-0 flex items-center justify-center text-white/80">PlasmaWave</div>
</div>
```

```tsx
// 对冲流向 + 暖色：dir2 反向交织
<PlasmaWave
  className="absolute inset-0"
  colors={["var(--color-chart-3)", "oklch(0.72 0.22 30)"]}
  dir2={-1}
  speed1={0.1}
  bend1={1.4}
/>
```

## 禁忌 / 坑

- 与同族组件不同，PlasmaWave **不自带定位 class**，须自己传 `className="absolute inset-0"` 铺满 `relative` 父容器，叠加内容用 `absolute inset-0` / `relative z-10` [[webgl-canvas-rendered-but-invisible-negative-zindex-covered]]。
- WebGL 客户端组件（`"use client"`）；SSR 阶段只渲染 fallback。
- `colors` 传 `var(--color-…)` 时经离屏 canvas 解析，**须带 `--color-` 前缀**，裸 `var(--primary)` 解析失败 [[oklch-css-var-color-must-parse-via-offscreen-canvas]]。
- headless 截图常拍到静止/空白帧（rAF 动画被饿死），真机或 Playwright 实测才能看到流动 [[recharts-headless-screenshot-blank-clippath-animation-starved]]。

## 相关
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md)
