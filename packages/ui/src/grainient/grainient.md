---
slug: grainient
name: Grainient
category: decoration
group: backdrop
tags: [animated, webgl]
exports: [Grainient]
status: enriched
---

# Grainient

> 三色域扭曲 + 胶片颗粒的 WebGL 渐变背景 · 噪声驱动旋转 + 实时 grain/对比度后期(ogl·reduced-motion 降级静态渐变) · decoration/backdrop · #animated #webgl

## 何时用

需要柔和流动的三色渐变 + 胶片颗粒质感背景（hero、登录页、空状态、卡片底）时用。要带竖条百叶/聚光灯用 [GradientBlinds](../gradient-blinds/gradient-blinds.md)；要液态金属峰脊用 [Ferrofluid](../ferrofluid/ferrofluid.md)；要纯几何底纹用 [DotPattern](../dot-pattern/dot-pattern.md)。本组件最"安静"、颗粒胶片感最强，适合大面积铺底放文字。

## 导入
```ts
import { Grainient } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| timeSpeed | `number` | `0.25` | 时间流速倍率，0=静止 |
| colorBalance | `number` | `0` | 三色偏置，负偏 color3 一侧、正偏 color1 一侧 |
| warpStrength | `number` | `1` | 域扭曲强度（内部按反比，越大越克制），建议 0.3–3 |
| warpFrequency | `number` | `5` | 域扭曲正弦频率（褶皱密度） |
| warpSpeed | `number` | `2` | 域扭曲随时间漂移速度 |
| warpAmplitude | `number` | `50` | 域扭曲基础振幅，与 warpStrength 共定褶皱幅度 |
| blendAngle | `number` | `0` | 三色混合轴向角度（度） |
| blendSoftness | `number` | `0.05` | 色带过渡柔和度（smoothstep 边缘宽） |
| rotationAmount | `number` | `500` | 噪声驱动整体旋转量（度） |
| noiseScale | `number` | `2` | 旋转噪声采样缩放，越大越细碎 |
| grainAmount | `number` | `0.1` | 颗粒强度，0=纯净渐变 |
| grainScale | `number` | `2` | 颗粒采样缩放（密度） |
| grainAnimated | `boolean` | `false` | 颗粒是否随时间闪动，静态更省性能 |
| contrast | `number` | `1.5` | 对比度，围绕中灰拉伸明暗 |
| gamma | `number` | `1` | Gamma 校正，<1 提亮、>1 压暗 |
| saturation | `number` | `1` | 饱和度，0=灰阶、>1 增艳 |
| centerX | `number` | `0` | 视图中心横向偏移，配合 zoom 取景 |
| centerY | `number` | `0` | 视图中心纵向偏移 |
| zoom | `number` | `0.9` | 缩放，越小看到色场范围越大 |
| color1 | `string` | `--color-chart-1` | 渐变第一色（亮端），任意 CSS 颜色 |
| color2 | `string` | `--color-chart-2` | 渐变第二色（主色/中段） |
| color3 | `string` | `--color-chart-4` | 渐变第三色（暗端） |
| className | `string` | — | 透传根容器，自带 `absolute inset-0 z-0` |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| fallback | `ReactNode` | reduced-motion / 无 WebGL 静态渐变兜底层内的内容 |

## 示例
```tsx
// 默认：chart token 三色域扭曲渐变
<div className="relative h-56 overflow-hidden rounded-xl bg-neutral-950">
  <Grainient />
  <div className="relative z-10 flex h-full items-center justify-center text-white/85">
    瑚琏组件库
  </div>
</div>
```
```tsx
// 自定义暖橙三色 + 放大取景
<Grainient color1="oklch(0.82 0.16 70)" color2="oklch(0.62 0.2 30)" color3="oklch(0.32 0.06 300)" zoom={1.3} />
```

## 禁忌 / 坑

- WebGL/ogl 客户端渲染：放在 `"use client"` 边界内；SSR / 无 WebGL 仅出静态渐变 fallback。
- 根自带 `absolute inset-0 z-0`，需放进 `relative` 容器；前景内容要 `relative z-10` 压在上层。
- `grainAnimated` 开启每帧重算颗粒会增加开销，大面积长驻背景建议保持默认静态颗粒。
- `warpStrength` 是"反比"语义——值越大扭曲反而越克制，别按直觉调大求强扭曲。

## 相关
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md)
