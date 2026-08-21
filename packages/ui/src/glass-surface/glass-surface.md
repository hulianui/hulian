---
slug: glass-surface
name: GlassSurface
category: decoration
group: overlay-fx
tags: [animated]
exports: [GlassSurface]
status: enriched
---

# GlassSurface

> 液态玻璃折射面 · SVG feDisplacementMap 三通道色散 + RGB 色差边缘(零依赖·token 磨砂底/发丝边/焦点环·RSC client·非 SVG 浏览器回落 backdrop-blur·reduced-motion 关过渡) · decoration/overlay-fx · #animated

## 何时用

需要一块真实「液态玻璃」折射面板（药丸/卡片/按钮底），透过它看到背景被位移扭曲并产生 RGB 色散时用。要做跟随指针的整屏流体玻璃背景用 [FluidGlass](../fluid-glass/fluid-glass.md)；要做局部放大镜用 [Lens](../lens/lens.md)。GlassSurface 是「固定尺寸的折射面板」，靠 SVG 位移图实现，需要丰富背景才看得出效果。

## 导入
```ts
import { GlassSurface } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| width | `number ｜ string` | `200` | 宽度，number 视作 px，string 原样透传 |
| height | `number ｜ string` | `80` | 高度，number 视作 px，string 原样透传 |
| borderRadius | `number` | `20` | 圆角半径 px，同时作用于容器与位移图内部矩形 |
| borderWidth | `number` | `0.07` | 边缘高光带宽度系数 0~1（相对短边），越大折射越宽 |
| brightness | `number` | `50` | 位移图内部矩形亮度（HSL 的 L，0~100），控制玻璃厚度质感 |
| opacity | `number` | `0.93` | 位移图内部矩形不透明度 0~1 |
| blur | `number` | `11` | 位移图内部矩形高斯模糊半径 px，柔化折射边界 |
| displace | `number` | `0` | 折射结果二次高斯模糊，消像素锯齿 |
| backgroundOpacity | `number` | `0` | 磨砂底色不透明度，0=全透明 |
| saturation | `number` | `1` | backdrop-filter 饱和度倍率 |
| distortionScale | `number` | `-180` | 位移强度，负值内凹、正值外凸，三通道叠加制造色散 |
| redOffset | `number` | `0` | 红通道相对 distortionScale 的额外位移（色差） |
| greenOffset | `number` | `10` | 绿通道额外位移（色差） |
| blueOffset | `number` | `20` | 蓝通道额外位移（色差） |
| xChannel | `GlassChannel` | `"R"` | X 方向偏移取用通道（`"R"｜"G"｜"B"｜"A"`） |
| yChannel | `GlassChannel` | `"G"` | Y 方向偏移取用通道 |
| mixBlendMode | `CSSProperties["mixBlendMode"]` | `"difference"` | 位移图内红/蓝渐变叠加混合模式（决定折射纹理形态） |
| className | `string` | - | 透传根容器 className |
| style | `CSSProperties` | - | 透传根容器内联样式 |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| children | `ReactNode` | 玻璃面内容（居中于折射层之上） |

## 示例

```tsx
// 默认液态玻璃药丸（外层需有丰富背景才看得出折射）
<GlassSurface width={220} height={90} borderRadius={24}>
  <span className="text-sm font-semibold text-foreground">Glass Surface</span>
</GlassSurface>

// 强色散厚玻璃
<GlassSurface
  width={240}
  height={100}
  borderRadius={28}
  distortionScale={-220}
  greenOffset={25}
  blueOffset={45}
>
  <span className="text-sm font-semibold text-foreground">瑚琏</span>
</GlassSurface>
```

## 禁忌 / 坑

- 折射靠 SVG feDisplacementMap 位移背景像素，纯色/空白背景下几乎看不出效果，必须放在有渐变/纹理/图片的背景上。
- 不支持 SVG 滤镜的浏览器会回落到 backdrop-blur（无色散）；这是组件内置降级，不是 bug。
- 客户端组件（依赖运行时 SVG 滤镜与指针），SSR 下仅出静态壳，交互态须在浏览器验证。
- reduced-motion 下关闭过渡动画（折射本身仍在）。

## 相关
[BorderBeam](../border-beam/border-beam.md) · [ShineBorder](../shine-border/shine-border.md) · [GlareHover](../glare-hover/glare-hover.md) · [Lens](../lens/lens.md) · [AnimatedBeam](../animated-beam/animated-beam.md) · [OrbitingCircles](../orbiting-circles/orbiting-circles.md)
