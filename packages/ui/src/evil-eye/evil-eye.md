---
slug: evil-eye
name: EvilEye
category: decoration
group: backdrop
tags: [animated, webgl]
exports: [EvilEye]
status: enriched
---

# EvilEye

> 火焰邪眼 · WebGL 背景 · 极坐标多层程序化噪声画出翻腾火焰瞳孔 + 瞳孔惯性跟随光标 + 外圈弥散辉光（ogl·token 自适应·reduced-motion 静态降级） · decoration/backdrop · #animated #webgl

## 何时用

需要一个有"注视感"、能跟随鼠标的高戏剧化主视觉背景（hero / 404 / 启动页）时用。要纯平铺的几何底纹用 [DotPattern](../dot-pattern/dot-pattern.md) / [GridPattern](../grid-pattern/grid-pattern.md)；要鼠标聚光跟随但不要"眼睛"具象图形用 [Spotlight](../spotlight/spotlight.md)；要水波涟漪点缀用 [Ripple](../ripple/ripple.md)。

## 导入
```ts
import { EvilEye } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| eyeColor | `string` | `--color-chart-3` | 主火焰色，任意 CSS 颜色（hex/oklch/rgb/`var(--…)`）。不传吃主题 token，随明暗换色 |
| backgroundColor | `string` | 透明（回退黑） | 背景底色，一般留默认由容器深底衬托 |
| intensity | `number` | `1.5` | 发光强度倍率，越大越亮，建议 0.8–2.5 |
| pupilSize | `number` | `0.6` | 瞳孔大小，越大越饱满、越小越收成缝，建议 0.2–1.0 |
| irisWidth | `number` | `0.25` | 虹膜（内环火焰）宽度，建议 0.1–0.4 |
| glowIntensity | `number` | `0.35` | 外圈辉光浓度，建议 0.1–0.6 |
| scale | `number` | `0.8` | 眼睛缩放，越大占画面越多，建议 0.5–1.2 |
| noiseScale | `number` | `1.0` | 火焰噪声纹理缩放，越大纹路越细碎，建议 0.5–2.0 |
| pupilFollow | `number` | `1.0` | 瞳孔跟随光标幅度，0=不动；带惯性 lerp，松手缓缓回正 |
| flameSpeed | `number` | `1.0` | 火焰流动速度，建议 0.3–2.0 |
| className | `string` | — | 透传根容器，组件默认 `block h-full w-full`，尺寸由容器决定 |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| fallback | `ReactNode` | reduced-motion / 无 WebGL 降级时叠在静态兜底层里的内容 |

## 示例
```tsx
// 默认：吃主题 chart-3 暖橙，瞳孔跟随光标
<div className="relative h-64 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.13 0.01 60)" }}>
  <EvilEye className="absolute inset-0" />
</div>
```
```tsx
// 壁纸级：瞳孔不跟随 + 慢火
<EvilEye className="absolute inset-0" pupilFollow={0} flameSpeed={0.5} noiseScale={1.3} />
```

## 禁忌 / 坑

- WebGL/ogl 客户端渲染：放在 `"use client"` 边界内；SSR 阶段只出静态 fallback 兜底层，首屏视觉以 fallback 为准。
- 根需放进 `relative` + `overflow-hidden` 的定位容器，并自带高度（如 `h-64`），否则铺不满或溢出。
- 深色背景才看得清火焰，浅底上请显式传 `backgroundColor` 或在容器上铺深底。
- `pupilFollow` 跟随依赖指针事件，移动端/无指针环境等同 0。

## 相关
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md)
