---
slug: meta-balls
name: MetaBalls
category: decoration
group: overlay-fx
tags: [animated]
exports: [MetaBalls]
status: enriched
---

# MetaBalls

> 黏液融球 · 一组黏液球（metaball）公转游走、距离平方反比势场叠加 smoothstep 等值面产生融合/分裂的有机黏连背景 · 主体球与跟随鼠标的光标球交界处混色 + 自动巡游兜底(ogl·token 配色·reduced-motion 静态渐变球团 fallback) · decoration/overlay-fx · #animated

## 何时用

需要一块「有机液态」的发光装饰背景（hero、卡片底、加载页），球体会融合分裂、跟随鼠标。要的是边缘擦亮/折射光感选 [ShapeBlur](../shape-blur/shape-blur.md)、Lens；要的是规整环绕的图标轨道选 [OrbitingCircles](../orbiting-circles/orbiting-circles.md)；MetaBalls 是其中最「流体黏连」的一档，放在深色底上发光最佳。

## 导入
```ts
import { MetaBalls } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| color | `string` | `"var(--color-chart-1)"` | 主体小球聚合时的填充色。喂 token 必须带 `--color-` 前缀 |
| cursorBallColor | `string` | `"var(--color-chart-4)"` | 光标球颜色，与 color 在交界处混合 |
| speed | `number` | `0.3` | 公转速度倍率，越大游走越快 |
| enableMouseInteraction | `boolean` | `true` | 启用鼠标交互；关闭后光标球自动椭圆巡游 |
| hoverSmoothness | `number` | `0.05` | 光标球插值平滑系数（0–1），越小越拖尾、越大越跟手 |
| animationSize | `number` | `30` | 观察尺度，越大视野越广、小球越小越散 |
| ballCount | `number` | `15` | 主体小球数量（1–50，超出夹取到 50） |
| clumpFactor | `number` | `1` | 聚拢因子，越大轨道越外扩松散，越小越抱团 |
| cursorBallSize | `number` | `3` | 光标球半径（着色器单位） |
| enableTransparency | `boolean` | `true` | 透明背景；false 时填黑底 |
| className | `string` | — | 透传到 canvas / fallback 容器 |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| fallback | `ReactNode` | reduced-motion / 无 WebGL 时的自定义静态备用内容 |

## 示例
```tsx
// 深色底 + 默认参数（容器需 relative + overflow-hidden）
<div className="relative h-64 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.14 0.02 255)" }}>
  <MetaBalls className="absolute inset-0" />
</div>
```
```tsx
// 暖色混调 + 自动巡游（关闭鼠标交互，适合纯背景）
<MetaBalls
  className="absolute inset-0"
  color="var(--color-chart-3)"
  cursorBallColor="var(--color-chart-5)"
  enableMouseInteraction={false}
  speed={0.25}
/>
```

## 禁忌 / 坑

- 喂 token 色给 `color` / `cursorBallColor` 必须带 `--color-` 前缀（`var(--color-chart-1)`），裸 `var(--primary)` 在本 Tailwind v4 体系下 shader 解析不到会变黑。见 [[hulian-token-color-var-needs-color-prefix]]。
- WebGL/ogl 组件，仅客户端渲染；放在 RSC 页面里注意它是 `"use client"`。StrictMode 双挂载下 canvas context 复用可能毒化，参考 [[webgl-canvas-loseContext-poisons-strictmode-remount]]。
- 父容器需 `relative` + `overflow-hidden`，组件用 `absolute inset-0` 铺满；底色建议深色才看得清发光黏球。

## 相关
[BorderBeam](../border-beam/border-beam.md) · [ShineBorder](../shine-border/shine-border.md) · [GlareHover](../glare-hover/glare-hover.md) · [Lens](../lens/lens.md) · [AnimatedBeam](../animated-beam/animated-beam.md) · [OrbitingCircles](../orbiting-circles/orbiting-circles.md)
