---
slug: orbiting-circles
name: OrbitingCircles
category: decoration
group: overlay-fx
tags: [animated]
exports: [OrbitingCircles]
status: enriched
---

# OrbitingCircles

> 轨道环绕 · 子元素沿圆周匀速公转 + 自身反旋正立(纯 CSS·RSC) · decoration/overlay-fx · #animated

## 何时用

想让一组图标/头像沿圆形轨道围着中心匀速公转（技术栈环绕、集成生态、品牌 logo 群）时用。子元素按数量均匀分布到圆周、自身反旋保持正立；纯 CSS、可在 RSC 渲染。可叠多个不同 `radius`/`duration` 做多层轨道。要把两个具体节点用流光连起来用 [AnimatedBeam](../animated-beam/animated-beam.md)。

## 导入
```ts
import { OrbitingCircles } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| radius | `number` | — | 轨道半径 px |
| duration | `number` | — | 一圈时长 s |
| reverse | `boolean` | `false` | 反向旋转 |
| iconSize | `number` | — | 子元素方框尺寸 px |
| showPath | `boolean` | — | 是否画出轨道虚线圆环 |
| className | `string` | — | 透传 className |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| children | `ReactNode` | 环绕的子元素（图标等），按数量均匀分布到圆周 |

## 示例

```tsx
// 双层轨道：内外层反向旋转
<div className="relative flex size-[340px] items-center justify-center">
  <span className="text-sm font-medium text-muted">瑚琏</span>
  <OrbitingCircles radius={140} duration={20}>
    <Icon /><Icon /><Icon /><Icon />
  </OrbitingCircles>
  <OrbitingCircles radius={80} duration={14} reverse iconSize={32}>
    <Icon /><Icon />
  </OrbitingCircles>
</div>
```

## 禁忌 / 坑

- 放在居中的 `relative` 容器内，且容器尺寸需 ≥ 2×radius，否则轨道被裁。
- 纯 CSS 实现，可在 RSC 直接用，无需 `"use client"`。
- reduced-motion 偏好下公转会被弱化/停止，不要把它当唯一的信息载体。

## 相关
[BorderBeam](../border-beam/border-beam.md) · [ShineBorder](../shine-border/shine-border.md) · [GlareHover](../glare-hover/glare-hover.md) · [Lens](../lens/lens.md) · [AnimatedBeam](../animated-beam/animated-beam.md) · [ProgressiveBlur](../progressive-blur/progressive-blur.md)
