---
slug: ferrofluid
name: Ferrofluid
category: decoration
group: backdrop
tags: [animated, webgl]
exports: [Ferrofluid]
status: enriched
---

# Ferrofluid

> 液态金属铁磁流体 WebGL 背景组件 · value-noise 峰脊 + smin 软融合 + rim 亮带流动 + 鼠标下凹交互(ogl·主题 chart token·reduced-motion 径向渐变兜底) · decoration/backdrop · #animated #webgl

## 何时用

需要高级感的液态金属 / 流体辉光背景（品牌 hero、产品页）时用。要更偏星河深空用 [Galaxy](../galaxy/galaxy.md)；要纯几何底纹用 [DotPattern](../dot-pattern/dot-pattern.md) / [GridPattern](../grid-pattern/grid-pattern.md)；要鼠标聚光不要流体峰脊用 [Spotlight](../spotlight/spotlight.md)。本组件主打"金属液面流动 + 鼠标下凹"质感。

## 导入
```ts
import { Ferrofluid } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| colors | `string[]` | `--color-chart-1/2/4` | 流体色带，最多 8 色，按高度梯度低→高映射；任意 CSS 颜色 |
| speed | `number` | `0.5` | 动画速度因子，越大流动越快 |
| scale | `number` | `1.6` | 噪声/纹理缩放，越大越细密；< 0.05 钳到下限 |
| turbulence | `number` | `1` | 湍流强度，0=近乎静止平滑液面 |
| fluidity | `number` | `0.1` | 峰脊融合柔度，越大越像液体，下限 0.001 |
| rimWidth | `number` | `0.2` | 高光边缘宽度 |
| sharpness | `number` | `2.5` | 高光锐度 gamma，越大亮带越收束 |
| shimmer | `number` | `1.5` | 微光扰动强度，制造金属闪烁 |
| glow | `number` | `2` | 整体辉光增益，越大越发光 |
| flowDirection | `"up" \| "down" \| "left" \| "right"` | `"down"` | 峰脊整体漂移方向 |
| opacity | `number` | `1` | 整体不透明度，范围 0–1 |
| mouseInteraction | `boolean` | `true` | 指针处液面下凹/抑制亮带；无 WebGL 环境自动无效 |
| mouseStrength | `number` | `1` | 鼠标影响强度，仅 mouseInteraction=true 生效 |
| mouseRadius | `number` | `0.35` | 鼠标影响半径（归一化） |
| mouseDampening | `number` | `0.15` | 鼠标跟随阻尼（秒），0=立即跟随 |
| dpr | `number` | `min(dpr, 2)` | 设备像素比上限，调低省 GPU |
| className | `string` | — | 透传根容器（或兜底 div） |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| fallback | `ReactNode` | reduced-motion / 无 WebGL 时的静态替代内容（默认径向渐变 div） |

## 示例
```tsx
// 默认：吃主题 chart token 三色
<div className="relative h-56 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.13 0.02 265)" }}>
  <Ferrofluid />
</div>
```
```tsx
// 壁纸级：慢速大尺度，关鼠标交互
<Ferrofluid speed={0.25} scale={2.4} glow={2.4} mouseInteraction={false} />
```

## 禁忌 / 坑

- WebGL/ogl 客户端渲染：放在 `"use client"` 边界内；SSR / 无 WebGL 仅出径向渐变 fallback。
- 根需放进 `relative overflow-hidden` 定位容器并自带高度。
- 深色底才衬得出金属流体，浅底上层次会糊。
- 高分屏可显式传 `dpr={1}` 省 GPU；`turbulence` / `shimmer` 调高会增加片元开销。

## 相关
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md)
