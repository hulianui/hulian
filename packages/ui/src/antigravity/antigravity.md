---
slug: antigravity
name: Antigravity
category: decoration
group: overlay-fx
tags: [animated]
exports: [Antigravity]
status: enriched
---

# Antigravity

> 反重力粒子吸附背景 · 光标靠近把漂浮粒子吸入环绕轨道(波动+脉冲+取向)，离开缓回原位 · 磁吸半径/环半径/形状/自动巡游可调(canvas2d 零依赖·token 配色·reduced-motion 静态点阵) · decoration/overlay-fx · #animated

## 何时用

需要整片粒子背景，光标靠近把粒子吸入环绕轨道、离开缓回（hero 区、大屏装饰）时用。它是 canvas2d 粒子吸附；要光标本身的果冻拖尾用 [BlobCursor](../blob-cursor/blob-cursor.md)，要点击迸发火花用 [ClickSpark](../click-spark/click-spark.md)，要边框流光描边用 [BorderBeam](../border-beam/border-beam.md)。

## 导入
```ts
import { Antigravity } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| count | `number` | `240` | 粒子数量；越多越费性能，移动端建议 ≤ 200 |
| magnetRadius | `number` | `130` | 磁吸半径（px）；光标进入此范围的粒子被吸入轨道 |
| ringRadius | `number` | `56` | 环绕轨道基础半径（px） |
| waveSpeed | `number` | `0.4` | 环上波动速度（轨道半径随角度/时间起伏快慢） |
| waveAmplitude | `number` | `10` | 环上波动幅度（px），越大轨道越毛糙有机 |
| particleSize | `number` | `4` | 粒子基础尺寸（px）；dot=直径 / square=边长 / bar=长度 |
| lerpSpeed | `number` | `0.12` | 粒子追踪目标的缓动系数（0–1），越大越紧跟 |
| color | `string` | `var(--color-chart-1)` | 粒子颜色（自动明暗适配），可传任意 CSS 颜色 |
| autoAnimate | `boolean` | `false` | 光标静止 2s 后是否自动巡游（无人操作也动） |
| rotationSpeed | `number` | `0` | 整环随时间旋转角速度（rad/s），0=不自转 |
| pulseSpeed | `number` | `3` | 粒子脉冲缩放速度（被吸住时大小呼吸快慢） |
| shape | `"dot" \| "square" \| "bar"` | `"bar"` | 粒子形状 |
| className | `string` | — | 透传到根容器（canvas 包裹层 / fallback） |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| fallback | `ReactNode` | reduced-motion 或无 canvas2d 时的自定义静态备用内容 |

## 示例
```tsx
// 默认短棒粒子，铺满定位父级
<div className="relative h-64 overflow-hidden rounded-xl">
  <Antigravity className="absolute inset-0" />
</div>

// 自动巡游 + 方块 + token 配色
<Antigravity
  className="absolute inset-0"
  autoAnimate
  rotationSpeed={0.4}
  shape="square"
  color="var(--color-chart-2)"
/>
```

## 禁忌 / 坑

- 客户端组件（canvas2d）：父级须为定位上下文且有明确高度，组件用 `absolute inset-0` 铺满。
- `color` 用 token 必须带 `--color-` 前缀（`var(--color-chart-1)`），canvas 喂裸 `var(--chart-1)` 不解析。见 [[hulian-token-color-var-needs-color-prefix]]。
- `count` 直接影响性能，移动端/低端机控制在 ≤ 200。
- reduced-motion 或无 canvas2d 环境降级为静态点阵，可用 `fallback` 自定义。

## 相关
[BorderBeam](../border-beam/border-beam.md) · [ShineBorder](../shine-border/shine-border.md) · [GlareHover](../glare-hover/glare-hover.md) · [Lens](../lens/lens.md) · [AnimatedBeam](../animated-beam/animated-beam.md) · [OrbitingCircles](../orbiting-circles/orbiting-circles.md)
