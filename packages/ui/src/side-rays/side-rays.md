---
slug: side-rays
name: SideRays
category: decoration
group: backdrop
tags: [animated, webgl]
exports: [SideRays]
status: enriched
---

# SideRays

> 从屏幕一角发散的动态侧光束 WebGL 背景 · 双束角度正弦摆动+平方反比衰减+饱和度/混色调节(ogl·token 双色·reduced-motion 静态兜底) · decoration/backdrop · #animated #webgl

## 何时用

要从某个角落射出、缓慢摆动的体积光束氛围（hero / 登录页一侧打光）。要中心聚光跟随鼠标用 [Spotlight](../spotlight/spotlight.md)；要满屏点/线纹理用 [DotPattern](../dot-pattern/dot-pattern.md) / [StripedPattern](../striped-pattern/striped-pattern.md)；SideRays 是这族里唯一从四角任一起点发散双束、可调张角/混色/饱和度的「侧打光」专项。

## 导入
```ts
import { SideRays } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| speed | `number` | `2.5` | 光束动画速度因子（第二束 0.2× 慢速错相），映射 GLSL iSpeed |
| rayColor1 | `string` | `var(--color-chart-1)` | 主光束颜色，任意 CSS 颜色串 |
| rayColor2 | `string` | `var(--color-chart-2)` | 辅光束颜色，与主色叠加产生混色 |
| intensity | `number` | `2` | 整体亮度强度，过大易过曝 |
| spread | `number` | `2` | 光束张开角度（扇面宽度），越小越聚拢成一道 |
| origin | `"top-left"｜"top-right"｜"bottom-left"｜"bottom-right"` | `"top-right"` | 光束发散的角落起点 |
| tilt | `number` | `0` | 光束整体倾斜角度（度），绕光源点旋转扇面 |
| saturation | `number` | `1.5` | 饱和度，1=原色 / >1 增艳 / 0=去色 |
| blend | `number` | `0.75` | 两束混色比例（0–1），0=仅主色 / 1=仅辅色 |
| falloff | `number` | `1.6` | 亮度随距离衰减指数，越大越集中光源附近 |
| opacity | `number` | `1` | 整体不透明度（0–1），叠内容上常用 0.5–0.8 |
| className | `string` | — | 透传根容器；组件自带 `absolute inset-0 z-0` |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| fallback | `ReactNode` | reduced-motion / 无 WebGL 时的静态替代内容（默认角向 radial-gradient div） |

## 示例
```tsx
// 默认右上角发散，吃 chart token 双色
<div className="relative h-56 overflow-hidden rounded-xl">
  <SideRays opacity={0.85} />
</div>

// 左下角起点 · 暖色双束
<SideRays
  origin="bottom-left"
  rayColor1="oklch(0.78 0.18 70)"
  rayColor2="oklch(0.7 0.22 30)"
  intensity={2.4}
  opacity={0.8}
/>
```

## 禁忌 / 坑

- 须客户端渲染（WebGL/ogl），组件自带 `"use client"`；RSC 页里挂 client 子树或动态 import。
- 组件自带 `absolute inset-0 z-0`，父容器须有定位 + 尺寸 + `overflow-hidden`，否则不可见。
- `intensity` 过大光源处易过曝纯白；叠在内容上用 `opacity` 0.5–0.8 降干扰。
- reduced-motion / 无 WebGL 时降级为静态 `fallback`（保留方位感），别把摆动当关键信息。

## 相关
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md)
