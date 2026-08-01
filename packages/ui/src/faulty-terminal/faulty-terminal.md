---
slug: faulty-terminal
name: FaultyTerminal
category: decoration
group: backdrop
tags: [animated, webgl]
exports: [FaultyTerminal]
status: enriched
---

# FaultyTerminal

> 故障终端雨 · 出故障的 CRT 终端字符雨 WebGL 背景 · fbm 噪声点阵 + 横向撕裂/扫描线/闪烁/桶形畸变/色散 + 鼠标涟漪(ogl·token 着色·reduced-motion 兜底) · decoration/backdrop · #animated #webgl

## 何时用

需要赛博朋克 / 黑客终端 / 复古 CRT 故障风的高动效背景（hero、加载页、404）时用。要静态规整的格纹底用 [GridPattern](../grid-pattern/grid-pattern.md)；要复古透视网格地平线用 [RetroGrid](../retro-grid/retro-grid.md)；要纯条纹用 [StripedPattern](../striped-pattern/striped-pattern.md)。本组件动效最重、最具"信号失真"叙事。

## 导入
```ts
import { FaultyTerminal } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| scale | `number` | `1.5` | 整体 UV 缩放，越大字符网格越密、视野越远 |
| gridMul | `[number, number]` | `[2, 1]` | 字符网格行列倍率 [x, y]，横向更密仿宽屏终端 |
| digitSize | `number` | `1.5` | 单个字符内点阵大小，越大每个"数字"块越胖 |
| timeScale | `number` | `0.3` | 时间流速因子，越大故障/闪烁越快 |
| pause | `boolean` | `false` | 冻结动画定格；reduced-motion 下强制冻结，与本 prop 取或 |
| scanlineIntensity | `number` | `0.3` | 扫描线强度，0=无 |
| glitchAmount | `number` | `1` | 横向撕裂量，>1 更夸张，1=原始位移 |
| flickerAmount | `number` | `1` | 整屏忽明忽暗闪烁量，0=无 |
| noiseAmp | `number` | `0` | 背景有机噪声振幅，增大叠加流动雾噪 |
| chromaticAberration | `number` | `0` | 色散（RGB 分离）像素量，建议 0–6 |
| dither | `number \| boolean` | `0` | 抖动颗粒强度，boolean 时 true=1/false=0 |
| curvature | `number` | `0.2` | 桶形畸变（CRT 球面弯曲），0=平面 |
| tint | `string` | `--color-chart-2` | 字符着色，任意 CSS 颜色，不传吃主题 token |
| mouseReact | `boolean` | `true` | 是否响应鼠标（字符发亮 + 涟漪） |
| mouseStrength | `number` | `0.2` | 鼠标影响强度，仅 mouseReact=true 生效 |
| pageLoadAnimation | `boolean` | `true` | 加载时逐格淡入动画 |
| brightness | `number` | `1` | 整体亮度倍率 |
| className | `string` | — | 透传根容器（或兜底层） |
| style | `CSSProperties` | — | 透传根容器内联样式 |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| fallback | `ReactNode` | reduced-motion / 无 WebGL 时的静态替代内容 |

## 示例
```tsx
// 默认：绿色字符雨
<div className="relative h-56 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.12 0.01 255)" }}>
  <FaultyTerminal />
</div>
```
```tsx
// 老 CRT：暖橙 + 强桶形畸变 + 色散
<FaultyTerminal tint="oklch(0.72 0.2 45)" curvature={0.45} scanlineIntensity={0.5} chromaticAberration={3} />
```

## 禁忌 / 坑

- WebGL/ogl 客户端渲染：放在 `"use client"` 边界内；SSR 只出 fallback 静态兜底。
- `pause` 不是唯一冻结开关——reduced-motion 偏好会强制冻结（取或），调试动画时注意系统设置。
- 根需放进 `relative overflow-hidden` 定位容器并自带高度（如 `h-56`）。
- `chromaticAberration` / `glitchAmount` 调高很费 GPU，长驻背景慎用大值。

## 相关
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md)
