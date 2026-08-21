---
slug: shape-blur
name: ShapeBlur
category: decoration
group: overlay-fx
tags: [animated]
exports: [ShapeBlur]
status: enriched
---

# ShapeBlur

> 模糊形状高光 · 鼠标揭示的模糊形状高光 WebGL 件 · 圆角矩形/圆/圆环/三角四形态 + 阻尼跟随柔光圆擦亮边缘(ogl·token·reduced-motion 降级静态光晕) · decoration/overlay-fx · #animated

## 何时用

需要一块「鼠标靠近才被柔光擦亮的模糊形状高光」装饰背景（hero 留白处、卡片底的隐约几何）。要的是流体黏球选 [MetaBalls](../meta-balls/meta-balls.md)，要的是图片放大镜选 [Lens](../lens/lens.md)；ShapeBlur 是其中最克制的一档——平时几乎隐形，鼠标过处才浮现 SDF 几何边缘。

## 导入
```ts
import { ShapeBlur } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| variation | `"round-rect"｜"circle-fill"｜"circle-stroke"｜"triangle"` | `"round-rect"` | 形状预设（圆角矩形描边/实心圆/圆环描边/三角填充） |
| shapeSize | `number` | `1.2` | 形状整体尺寸（GLSL u_shapeSize），越大越大 |
| roundness | `number` | `0.4` | 圆角程度，仅 round-rect 生效，0=直角 |
| borderSize | `number` | `0.05` | 描边宽度，仅描边类（round-rect/circle-stroke）生效 |
| circleSize | `number` | `0.3` | 跟随鼠标的柔光圆半径（擦亮区域大小） |
| circleEdge | `number` | `0.5` | 柔光圆边缘羽化，越大越柔 |
| color | `string` | `var(--color-foreground)` | 形状主色，CSS 颜色或带 `--color-` 前缀的 token |
| damping | `number` | `8` | 鼠标跟随阻尼，越大跟随越快、越小越懒 |
| className | `string` | - | 透传到 root 容器 div |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| fallback | `ReactNode` | reduced-motion / 无 WebGL 时的静态替代（默认 foreground 径向光晕 div） |

## 示例
```tsx
// 默认圆角矩形描边（容器需 relative + overflow-hidden，移动鼠标揭示）
<div className="relative h-64 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.13 0.02 270)" }}>
  <ShapeBlur variation="round-rect" />
</div>
```
```tsx
// 圆环描边 + 暖金色 + 更大光圆
<ShapeBlur variation="circle-stroke" color="oklch(0.82 0.16 75)" circleSize={0.35} />
```

## 禁忌 / 坑

- `color` 给 token 必须带 `--color-` 前缀，裸 `var(--primary)` shader 不解析；showcase 里 `color` 留空即用默认 foreground。见 [[hulian-token-color-var-needs-color-prefix]]。
- WebGL/ogl 组件，仅客户端渲染；StrictMode 双挂载 canvas context 复用风险见 [[webgl-canvas-loseContext-poisons-strictmode-remount]]。
- 组件自带 `absolute inset-0 z-0`，父容器需 `relative` + `overflow-hidden`；`roundness`/`borderSize` 只在对应 variation 下生效，换形状别忘对照。

## 相关
[BorderBeam](../border-beam/border-beam.md) · [ShineBorder](../shine-border/shine-border.md) · [GlareHover](../glare-hover/glare-hover.md) · [Lens](../lens/lens.md) · [AnimatedBeam](../animated-beam/animated-beam.md) · [OrbitingCircles](../orbiting-circles/orbiting-circles.md)
