---
slug: gradient-blinds
name: GradientBlinds
category: decoration
group: backdrop
tags: [animated, webgl]
exports: [GradientBlinds]
status: enriched
---

# GradientBlinds

> 渐变百叶窗 · WebGL 背景 · 多色站水平渐变 + 竖条百叶明暗调制 + 跟随鼠标聚光灯 + 颗粒噪声(可旋转/镜像/扭曲) · 默认吃 chart token(ogl·reduced-motion 静态百叶降级) · decoration/backdrop · #animated #webgl

## 何时用

需要带竖条百叶质感 + 鼠标聚光灯的彩色渐变背景（hero、营销区块、卡片底）时用。要纯条纹无渐变聚光用 [StripedPattern](../striped-pattern/striped-pattern.md)；要纯鼠标聚光不要百叶用 [Spotlight](../spotlight/spotlight.md)；要液态流体用 [Ferrofluid](../ferrofluid/ferrofluid.md)。本组件融合渐变 + 百叶 + 聚光三者。

## 导入
```ts
import { GradientBlinds } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| gradientColors | `string[]` | `--color-chart-1/3` | 渐变色站，水平插值，最多取前 8；任意 CSS 颜色 |
| angle | `number` | `0` | 色带旋转角度（度），仅转渐变与百叶纹理不转容器 |
| noise | `number` | `0.3` | 颗粒噪声强度，0=纯净，建议 0–1 |
| blindCount | `number` | `16` | 百叶竖条数量，与 blindMinWidth 取较小者 |
| blindMinWidth | `number` | `60` | 单条最小宽度(px)，窄容器按此收敛条数；传 0/负值关闭约束 |
| mouseDampening | `number` | `0.15` | 聚光灯跟随阻尼(秒)，0=瞬时无阻尼 |
| mirrorGradient | `boolean` | `false` | 色带中点对折形成对称往返 |
| spotlightRadius | `number` | `0.5` | 聚光灯半径（归一化），最小钳 1e-4 |
| spotlightSoftness | `number` | `1` | 聚光灯衰减指数，越大边缘越锐 |
| spotlightOpacity | `number` | `1` | 聚光灯强度，0=无聚光灯 |
| distortAmount | `number` | `0` | 渐变扭曲幅度，越大色带越波浪 |
| shineDirection | `"left" \| "right"` | `"left"` | 高光扫光方向，"right" 翻转每条百叶明暗倾向 |
| dpr | `number` | `min(dpr, 2)` | 设备像素比上限 |
| className | `string` | — | 透传根容器 div |
| style | `CSSProperties` | — | 根容器内联样式，如 `mixBlendMode` |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| fallback | `ReactNode` | reduced-motion / 无 WebGL 时的静态替代内容（默认静态百叶 div） |

## 示例
```tsx
// 默认：chart token 双色 + 鼠标聚光灯
<div className="relative h-56 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.14 0.02 255)" }}>
  <GradientBlinds />
</div>
```
```tsx
// 斜向多色站 + 高条数
<GradientBlinds
  gradientColors={["var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-4)"]}
  angle={30}
  blindCount={24}
/>
```

## 禁忌 / 坑

- WebGL/ogl 客户端渲染：放在 `"use client"` 边界内；SSR / 无 WebGL 仅出静态百叶 fallback。
- `blindCount` 不是硬条数——窄容器下与 `blindMinWidth` 取较小者收敛；要严格按 count 渲染需把 `blindMinWidth` 设 0。
- 根需放进 `relative overflow-hidden` 定位容器并自带高度。
- 聚光灯跟随依赖指针事件，移动端/无指针下退化为静态色带。

## 相关
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md)
