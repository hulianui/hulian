---
slug: reveal
name: Reveal
category: decoration
group: overlay-fx
tags: [animated]
exports: [Reveal, Stagger, StaggerItem]
status: enriched
---

# Reveal

> 逐级揭示 · 通用「逐级揭示」块级动效原语 · Reveal 包裹元素进入视口时从位移/透明/缩放过渡到正常 + Stagger/StaggerItem 让子项按序错峰入场（非文字动画 · 作用于任意块级内容 · motion 运行时 · 吃 token · reduced-motion 直出终态） · decoration/overlay-fx · #animated

## 何时用

任意块级内容（卡片/段落/列表）想要进入视口或挂载时浮起淡入、多项按序错峰入场时用。这是通用块级动效原语，作用于任意 children；只针对文字逐字符滚动浮现的标题用 ScrollFloat，要边框光带/光泽等装饰特效用 BorderBeam / ShineBorder。

## 导入
```ts
import { Reveal, Stagger, StaggerItem } from "@hulianui/ui"
```

## Props

`Reveal` 与 `Stagger` 共有（继承 `div` props，剔除 motion 冲突的 onDrag*/onAnimationStart）：

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| trigger | `"in-view" \| "mount"` | `"in-view"`（showcase 演示用 `"mount"`） | 进入视口触发 / 挂载即播(首屏 hero) |
| once | `boolean` | `true` | in-view 时是否只播一次 |

**Reveal**（额外）：

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| y | `number` | `24` | 起始下移距离 px(自下浮起) |
| blur | `number` | `8` | 起始模糊 px(焦点拉入，GPU 合成) |
| scale | `number` | `1` | 起始缩放(<1 像「放上书架」落位) |
| delay | `number` | - | 延迟秒数(独立块错峰用；Stagger 内由容器编排无需 delay) |

**Stagger**（额外）：

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| gap | `number` | `0.08` | 子项间错峰秒数 |
| delay | `number` | `0` | 整组起始延迟秒数 |

**StaggerItem**（继承 `div` props，剔除 motion 冲突项）：

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| y | `number` | `18` | 起始下移距离 px |
| blur | `number` | `8` | 起始模糊 px |
| scale | `number` | `1` | 起始缩放(<1 像「放上书架」) |

## 示例
```tsx
// 单块：挂载浮起 + 焦点拉入
<Reveal trigger="mount" y={24} blur={8} scale={1}>
  <div className="card">浮起的内容</div>
</Reveal>

// 逐级编排：子项按 gap 错峰入场，压轴项加重 blur/scale
<Stagger trigger="mount" gap={0.1}>
  <div className="flex flex-col gap-3">
    <StaggerItem><Card>第一行</Card></StaggerItem>
    <StaggerItem><Card>第二行</Card></StaggerItem>
    <StaggerItem y={22} scale={0.94} blur={12}><Card>压轴项</Card></StaggerItem>
  </div>
</Stagger>
```

## 禁忌 / 坑

- 错峰编排走 `Stagger` 容器：放在 Stagger 内的 `StaggerItem` 不要自带 delay（由容器统一编排），独立块错峰才用 `Reveal` 的 delay。
- 这是 motion 运行时的客户端组件（含 `"use client"`）：在 Next.js App Router 里它已是 client 边界，按 server/client 边界正常组合即可，不必再为它把整个父布局升成 client。
- reduced-motion 下直接渲染终态（可见、不糊），别把入场动画当内容可见性的开关。

## 相关
[BorderBeam](../border-beam/border-beam.md) · [ShineBorder](../shine-border/shine-border.md) · [GlareHover](../glare-hover/glare-hover.md) · [Lens](../lens/lens.md) · [AnimatedBeam](../animated-beam/animated-beam.md) · [OrbitingCircles](../orbiting-circles/orbiting-circles.md)
