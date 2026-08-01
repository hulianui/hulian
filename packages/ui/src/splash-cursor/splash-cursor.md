---
slug: splash-cursor
name: SplashCursor
category: decoration
group: overlay-fx
tags: [animated]
exports: [SplashCursor]
status: enriched
---

# SplashCursor

> 流体溅射光标 · 指针流体溅射光标特效 · 移动溅彩+点击爆斑+拖尾消散 · 彩虹色相轮/固定 chart token 双模(canvas2d 零依赖·reduced-motion·RSC 安全) · decoration/overlay-fx · #animated

## 何时用

想给一块区域（或整页）加「鼠标移动溅彩、点击爆斑」的流体光标特效（hero、玩味落地页）。它是 canvas2d 零依赖 RSC 安全的纯特效层，`pointer-events-none` 不拦交互。要连续丝带拖尾选 [Ribbons](../ribbons/ribbons.md)，要像素颗粒余晖选 [PixelTrail](../pixel-trail/pixel-trail.md)；SplashCursor 是离散彩色染料溅射。

## 导入
```ts
import { SplashCursor } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| rainbow | `boolean` | `true` | 彩虹模式：每次溅射沿 HSV 色相轮循环。关闭后统一用 color |
| color | `string` | `var(--color-chart-1)` | 非彩虹模式的固定溅射色，token 须带 `--color-` 前缀；rainbow 时忽略 |
| splatRadius | `number` | `56` | 溅射半径基准（px），越大色斑越饱满 |
| splatForce | `number` | `1` | 溅射力度：随指针速度抛洒的位移与拖尾长度，建议 0.5–2 |
| dissipation | `number` | `0.92` | 色斑保留率（每秒衰减，0–1），越接近 1 越持久 |
| opacity | `number` | `1` | 整体不透明度（0–1），叠内容下方时可调暗 |
| className | `string` | — | 透传到根容器（占满父级 absolute inset-0）；父级需 relative |
| style | `CSSProperties` | — | 透传到根容器 |

## 示例
```tsx
// 默认彩虹溅射（父级需 relative + overflow-hidden）
<div className="relative h-64 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.14 0.02 255)" }}>
  <SplashCursor />
</div>
```
```tsx
// 固定主题色 · 猛烈拖尾
<SplashCursor rainbow={false} splatForce={1.8} dissipation={0.97} splatRadius={72} />
```

## 禁忌 / 坑

- 注意 `dissipation` 是「保留率」语义（与原版 DENSITY_DISSIPATION 反向）：越大越持久，不是越大越快消散。
- 非彩虹模式 `color` 给 token 用带 `--color-` 前缀的变量；彩虹开启时此值被忽略。见 [[hulian-token-color-var-needs-color-prefix]]。
- canvas2d 零依赖、RSC 安全、自带 `pointer-events-none` 不拦下层交互；父级必须 `relative` 它才能 `absolute inset-0` 铺满。reduced-motion 下降级不溅射。

## 相关
[BorderBeam](../border-beam/border-beam.md) · [ShineBorder](../shine-border/shine-border.md) · [GlareHover](../glare-hover/glare-hover.md) · [Lens](../lens/lens.md) · [AnimatedBeam](../animated-beam/animated-beam.md) · [OrbitingCircles](../orbiting-circles/orbiting-circles.md)
