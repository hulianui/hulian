---
slug: ribbons
name: Ribbons
category: decoration
group: overlay-fx
tags: [animated]
exports: [Ribbons]
status: enriched
---

# Ribbons

> 飘带跟随 · 弹簧追随鼠标的飘带 WebGL 效果 · ogl Polyline 多条折线弹性拖尾 + 可选沿带渐隐/正弦波动(ogl·token·reduced-motion) · decoration/overlay-fx · #animated

## 何时用

需要一组「弹性飘带跟随鼠标飞舞」的交互背景（hero、登录页、品牌动效）。同为鼠标跟随特效，要离散溅彩颗粒选 [SplashCursor](../splash-cursor/splash-cursor.md)，要点亮像素格选 [PixelTrail](../pixel-trail/pixel-trail.md)；Ribbons 是连续的丝带拖尾，飘逸感最强。

## 导入
```ts
import { Ribbons } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| colors | `string[]` | `["var(--color-chart-1)","--chart-2","--chart-3"]` | 飘带颜色数组，每色一条飘带；token 须带 `--color-` 前缀 |
| baseSpring | `number` | `0.03` | 弹簧刚度基准，越大追随越紧（每条叠加随机量制造错落） |
| baseFriction | `number` | `0.9` | 阻尼摩擦基准（0–1），越大越黏滞、过冲越少 |
| baseThickness | `number` | `30` | 飘带基础粗细（px） |
| offsetFactor | `number` | `0.05` | 多条飘带横向偏移因子，越大散得越开 |
| maxAge | `number` | `500` | 拖尾衰减寿命（ms），越大尾巴越长；0 或 Infinity 退回固定 0.9 lerp |
| pointCount | `number` | `50` | 每条飘带采样点数（决定折线平滑度） |
| speedMultiplier | `number` | `0.6` | 拖尾追赶速度倍率，配合 maxAge 控尾巴软硬 |
| enableFade | `boolean` | `false` | 沿飘带长度方向渐隐（尾部透明） |
| enableShaderEffect | `boolean` | `false` | shader 波动特效（沿法线正弦抖动） |
| effectAmplitude | `number` | `2` | shader 波动振幅，仅 enableShaderEffect=true 生效 |
| className | `string` | — | 透传到容器（或 reduced-motion fallback div） |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| fallback | `ReactNode` | reduced-motion / 无 WebGL 时的静态替代（默认 chart token 渐变 div） |

## 示例
```tsx
// 默认三色飘带（容器需 relative + overflow-hidden，移动鼠标追随）
<div className="relative h-56 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.14 0.02 285)" }}>
  <Ribbons />
</div>
```
```tsx
// 尾部渐隐 + 波动特效
<Ribbons enableFade enableShaderEffect effectAmplitude={2} />
```

## 禁忌 / 坑

- `colors` 里的 token 必须带 `--color-` 前缀，裸 `var(--primary)` shader 不解析。见 [[hulian-token-color-var-needs-color-prefix]]。
- WebGL/ogl 组件，仅客户端渲染；StrictMode 双挂载 canvas context 复用风险见 [[webgl-canvas-loseContext-poisons-strictmode-remount]]。
- 飘带追随的是全容器内的鼠标，父级需 `relative` + `overflow-hidden`；本组件不拦截下层交互。

## 相关
[BorderBeam](../border-beam/border-beam.md) · [ShineBorder](../shine-border/shine-border.md) · [GlareHover](../glare-hover/glare-hover.md) · [Lens](../lens/lens.md) · [AnimatedBeam](../animated-beam/animated-beam.md) · [OrbitingCircles](../orbiting-circles/orbiting-circles.md)
