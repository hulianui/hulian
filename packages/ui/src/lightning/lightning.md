---
slug: lightning
name: Lightning
category: decoration
group: backdrop
tags: [animated, webgl]
exports: [Lightning]
status: enriched
---

# Lightning

> 电弧极光 · fbm 噪声电弧/极光柱 WebGL 背景 · 距离场反比辉光 + hash 随机闪烁(ogl·token 取色·reduced-motion 静态降级) · decoration/backdrop · #animated #webgl

## 何时用

需要纵向电弧 / 极光柱辉光背景、带随机闪烁的科技感 hero 时用。要单根稳定的体积光柱用 [LightPillar](../light-pillar/light-pillar.md)；要放射状光束用 [LightRays](../light-rays/light-rays.md)；要坠落光束用 [Lightfall](../lightfall/lightfall.md)。

## 导入
```ts
import { Lightning } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| hue | `number` | `230` | 闪电色相(0-360, HSV 色环)，仅未传 `color` 时生效。例 30 暖橙 / 120 青绿 / 280 品紫 |
| color | `string` | `undefined` | 闪电主色，传入后覆盖 `hue` 路径，shader 直接吃；传 `var(--color-chart-1)` 可吃 token 明暗自适应 |
| xOffset | `number` | `0` | 水平偏移(clip-space)，正值推向右、负值推向左 |
| speed | `number` | `1` | 动画速度因子，越大闪烁/翻涌越快 |
| intensity | `number` | `1` | 辉度强度，越大越亮越粗 |
| size | `number` | `1` | 噪声尺度，越大分叉越细密、越小越宏观 |
| className | `string` | - | 透传根容器(reduced / WebGL 失败时透传 fallback div) |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| fallback | `ReactNode` | reduced-motion / 无 WebGL 时的静态替代内容，默认 token 纵向辉光渐变 |

## 示例
```tsx
// 默认蓝紫色相 230，容器定高 + overflow-hidden
<div className="relative h-64 overflow-hidden rounded-xl bg-black">
  <Lightning />
</div>
```
```tsx
// 吃 chart token，明暗自适应
<Lightning color="var(--color-chart-1)" intensity={1.2} />
```

## 禁忌 / 坑

- `color` 与 `hue` 二选一：传了 `color` 则 `hue` 失效。要 token 自适应优先用 `color="var(--color-chart-1)"`。
- ogl/WebGL 仅客户端；SSR / 无 WebGL 出 fallback（token 渐变），reduced-motion 下也降级。
- `color` 传 CSS 变量须用 `--color-` 前缀 token，裸 `var(--primary)` shader 不解析，见 [[hulian-token-color-var-needs-color-prefix]]。
- 全屏背景层在 opaque 背景的非层叠上下文父级里可能被父背景盖住，见 [[webgl-canvas-rendered-but-invisible-negative-zindex-covered]]。

## 相关
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md)
