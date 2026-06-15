---
slug: soft-aurora
name: SoftAurora
category: decoration
group: backdrop
tags: [animated, webgl]
exports: [SoftAurora]
status: enriched
---

# SoftAurora

> WebGL 柔和极光背景 · 3D Perlin 噪声 + cosine 渐变双层叠加 · 鼠标视差(ogl·token 着色·reduced-motion 降级) · decoration/backdrop · #animated #webgl

## 何时用

要柔和流动的极光/光晕氛围底（深色 hero、营销页大块留白）。要规整的点/线/网格纹理用 [DotPattern](../dot-pattern/dot-pattern.md) / [GridPattern](../grid-pattern/grid-pattern.md)；要从角落打出的体积光束用 [SideRays](../side-rays/side-rays.md)；SoftAurora 是这族里唯一双层 Perlin 噪声 + cosine 色相循环的「极光色带」专项。

## 导入
```ts
import { SoftAurora } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| color1 | `string` | `var(--color-chart-1)` | 主极光色带颜色（第 1 层），任意 CSS 颜色串（离屏 canvas 解析） |
| color2 | `string` | `var(--color-chart-4)` | 辅助极光色带颜色（第 2 层），错位叠加产生混色干涉 |
| speed | `number` | `0.6` | 极光流动速度倍率，建议 0.2–2 |
| scale | `number` | `1.5` | 噪声采样缩放，越大纹理越细碎，建议 0.8–3 |
| brightness | `number` | `1` | 整体亮度倍率 |
| noiseFrequency | `number` | `2.5` | 噪声基频，影响褶皱密度 |
| noiseAmplitude | `number` | `1` | 噪声基振幅，影响起伏幅度 |
| bandHeight | `number` | `0.5` | 极光带垂直位置（0–1），越小越靠下 |
| bandSpread | `number` | `1` | 极光带辉光扩散强度 |
| octaveDecay | `number` | `0.1` | 多倍频噪声衰减系数，控制高频细节占比 |
| layerOffset | `number` | `0` | 两层极光的时间相位偏移，非 0 时错峰流动 |
| colorSpeed | `number` | `1` | 色相循环流动速度（cosine 渐变水平滚动快慢） |
| enableMouseInteraction | `boolean` | `true` | 鼠标视差（极光随指针轻微平移） |
| mouseInfluence | `number` | `0.25` | 鼠标视差强度 |
| className | `string` | — | 透传到根容器 |
| fallback | `ReactNode` | — | reduced-motion / 无 WebGL 时降级静态层之上覆盖的内容 |
| style | `CSSProperties` | — | 透传到根容器的内联样式 |

## 示例
```tsx
// 默认 chart token 双层极光
<div className="relative h-56 overflow-hidden rounded-xl">
  <SoftAurora className="absolute inset-0" />
</div>

// 壁纸级：低速 · 关交互 · 靠底 · 自带标题 fallback
<SoftAurora
  speed={0.3}
  bandHeight={0.35}
  enableMouseInteraction={false}
  className="absolute inset-0"
  fallback={<h1 className="...">瑚琏组件库</h1>}
/>
```

## 禁忌 / 坑

- 须客户端渲染（WebGL/ogl），组件自带 `"use client"`；RSC 页里挂 client 子树或动态 import。
- 自身无 `inset-0`，须用 className 定位铺满（示例的 `absolute inset-0`）；父容器要有定位 + 尺寸 + `overflow-hidden`。
- `color1/color2` 走离屏 canvas 解析，可直接吃 `var(--color-chart-*)` token；裸 `var(--primary)` 不解析，见 [[hulian-token-color-var-needs-color-prefix]]。
- reduced-motion / 无 WebGL 时降级静态渐变并叠 `fallback`，别把流动当关键信息。

## 相关
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md)
