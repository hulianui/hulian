---
slug: laser-flow
name: LaserFlow
category: decoration
group: overlay-fx
tags: [animated]
exports: [LaserFlow]
status: enriched
---

# LaserFlow

> 激光束 · 自顶向下倾泻的体积激光束 WebGL 背景 · 极坐标光束几何 + fbm 噪声雾 + 行进微流光 + 指针牵引倾斜(ogl 去 three·主题感知·reduced-motion 降级) · decoration/overlay-fx · #animated

## 何时用

作为整屏/整块的 WebGL 体积光背景，自顶向下倾泻激光束 + 雾 + 流光，适合 hero/壁纸级氛围底。要环绕单元素的边框流光用 [BorderBeam](../border-beam/border-beam.md)；要鼠标拖尾烟雾用 [GhostCursor](../ghost-cursor/ghost-cursor.md)。本组件渲染量重，放在容器底层、内容用 `relative z-10` 叠在其上。

## 导入
```ts
import { LaserFlow } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| color | `string` | `var(--color-chart-1)` | 激光主色，吃明暗主题；任意 CSS 颜色串均可（→ uColor） |
| horizontalBeamOffset | `number` | `0.0` | 横向光束偏移（占视口宽比例），正右负左（→ uBeamXFrac） |
| verticalBeamOffset | `number` | `0.0` | 纵向光束偏移（占视口高比例）（→ uBeamYFrac） |
| flowSpeed | `number` | `0.35` | 光流脉冲速度因子，越大流动越快（→ uFlowSpeed） |
| verticalSizing | `number` | `2.0` | 纵向光束长度因子，越大越长（→ uVLenFactor） |
| horizontalSizing | `number` | `0.5` | 横向耀斑长度因子（→ uHLenFactor） |
| fogIntensity | `number` | `0.45` | 体积雾强度，0=无雾（→ uFogIntensity） |
| fogScale | `number` | `0.3` | 雾噪声缩放，越大雾团越细碎（→ uFogScale） |
| fogFallSpeed | `number` | `0.6` | 雾团下落速度（→ uFogFallSpeed） |
| wispDensity | `number` | `1` | 微流光密度 0–2（→ uWispDensity） |
| wispSpeed | `number` | `15` | 微流光行进速度（→ uWSpeed） |
| wispIntensity | `number` | `5` | 微流光亮度强度（→ uWIntensity） |
| flowStrength | `number` | `0.25` | 光流明暗脉冲强度 0–1（→ uFlowStrength） |
| decay | `number` | `1.1` | 光束衰减相位宽度（→ uDecay） |
| falloffStart | `number` | `1.2` | 光束发光起始衰减（→ uFalloffStart） |
| mouseTiltStrength | `number` | `0.01` | 鼠标牵引雾团倾斜强度；设 0 即关闭鼠标交互（→ uTiltScale） |
| className | `string` | — | 透传根容器（或 reduced-motion fallback div）额外 className |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| fallback | `ReactNode` | reduced-motion / 无 WebGL 时渲染的静态替代内容；缺省为吃 chart token 的纵向 linear-gradient 光束 div |

## 示例
```tsx
<div
  className="relative h-72 overflow-hidden rounded-xl"
  style={{ background: "oklch(0.13 0.02 285)" }}
>
  <LaserFlow />
  <div className="relative z-10 flex h-full items-center justify-center text-sm text-white/80">
    LaserFlow
  </div>
</div>
```

暖橙激光 + 高雾：
```tsx
<LaserFlow color="oklch(0.72 0.2 35)" fogIntensity={0.6} fogScale={0.35} />
```

## 禁忌 / 坑

- WebGL（ogl）组件，React StrictMode 双挂载下 cleanup 调 `loseContext` 会毒化 canvas 复用致空白崩溃，内部应每挂载新建 canvas，见 [[webgl-canvas-loseContext-poisons-strictmode-remount]]。
- 内容必须用 `relative z-10`（或更高）叠在 LaserFlow 之上，否则被体积光盖住。
- reduced-motion / 无 WebGL 会渲染 `fallback`（默认渐变 div），不要假设一定有动画。

## 相关
[BorderBeam](../border-beam/border-beam.md) · [ShineBorder](../shine-border/shine-border.md) · [GlareHover](../glare-hover/glare-hover.md) · [Lens](../lens/lens.md) · [AnimatedBeam](../animated-beam/animated-beam.md) · [OrbitingCircles](../orbiting-circles/orbiting-circles.md)
