---
slug: magic-rings
name: MagicRings
category: decoration
group: overlay-fx
tags: [animated]
exports: [MagicRings]
status: enriched
---

# MagicRings

> 同心魔法光环装饰背景 · GLSL 循环扩张/淡入淡出双色波纹 + 噪点颗粒 + 鼠标视差/悬停缩放/点击爆发（ogl·token 双色·reduced-motion 静态同心环降级） · decoration/overlay-fx · #animated

## 何时用

作为整块装饰背景，渲染不断向外扩张淡出的同心光环波纹（双色插值），适合登录页/hero/空状态底纹。要倾泻式体积激光用 [LaserFlow](../laser-flow/laser-flow.md)，要环绕单元素的边框流光用 [BorderBeam](../border-beam/border-beam.md)；本组件是「径向扩散涟漪」氛围层。建议 `className="absolute inset-0"` 铺满父容器。

## 导入
```ts
import { MagicRings } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| color | `string` | `var(--color-chart-1)` | 内圈起始色，吃明暗主题；任意 CSS 颜色串均可 |
| colorTwo | `string` | `var(--color-chart-4)` | 外圈终止色，光环色在 color→colorTwo 间按层数线性插值 |
| speed | `number` | `1` | 动画速度倍率，越大波纹扩散越快 |
| ringCount | `number` | `6` | 同时存在的光环层数（1–10，超出截断） |
| attenuation | `number` | `10` | 光晕衰减系数，越大环线越锐利短促，越小越弥散 |
| lineThickness | `number` | `2` | 环线粗细倍率 |
| baseRadius | `number` | `0.35` | 最内圈起始半径（归一化约 0–1） |
| radiusStep | `number` | `0.1` | 相邻两圈起始半径的递增步长 |
| scaleRate | `number` | `0.1` | 单生命周期内环半径的扩张幅度 |
| opacity | `number` | `1` | 整体不透明度，叠加在按亮度派生的 alpha 之上 |
| blur | `number` | `0` | CSS 模糊半径（px），>0 给画布加 filter:blur |
| noiseAmount | `number` | `0.1` | 颗粒噪点强度，0=干净 |
| rotation | `number` | `0` | 整体旋转角度（度） |
| ringGap | `number` | `1.5` | 各环角向裂口幅度，越大缺口越深呈花瓣状 |
| fadeIn | `number` | `0.7` | 单环淡入比例（生命周期前段） |
| fadeOut | `number` | `0.5` | 单环淡出起点比例（生命周期后段） |
| followMouse | `boolean` | `false` | 光环跟随鼠标位移产生视差 |
| mouseInfluence | `number` | `0.2` | followMouse 时鼠标对整体的位移影响系数 |
| hoverScale | `number` | `1.2` | 悬停时整体缩放目标值 |
| parallax | `number` | `0.05` | 各层随鼠标的视差错位系数 |
| clickBurst | `boolean` | `false` | 点击爆发（点击时短暂放大+提亮） |
| className | `string` | — | 透传根容器（或 fallback div）额外 className |

## 示例
```tsx
<div
  className="relative h-64 overflow-hidden rounded-xl"
  style={{ background: "oklch(0.14 0.02 280)" }}
>
  <MagicRings className="absolute inset-0" />
</div>
```

交互式（鼠标视差 + 点击爆发）：
```tsx
<MagicRings className="absolute inset-0" followMouse clickBurst hoverScale={1.25} />
```

## 禁忌 / 坑

- WebGL（ogl）组件，React StrictMode 双挂载下 cleanup 调 `loseContext` 会毒化 canvas 复用致空白，内部应每挂载新建 canvas，见 [[webgl-canvas-loseContext-poisons-strictmode-remount]]。
- 父容器须 `relative` + 深色底，光环用 `absolute inset-0` 铺满。
- reduced-motion / 无 WebGL 降级为静态同心环，不要假设一定有扩散动画。

## 相关
[BorderBeam](../border-beam/border-beam.md) · [ShineBorder](../shine-border/shine-border.md) · [GlareHover](../glare-hover/glare-hover.md) · [Lens](../lens/lens.md) · [AnimatedBeam](../animated-beam/animated-beam.md) · [OrbitingCircles](../orbiting-circles/orbiting-circles.md)
