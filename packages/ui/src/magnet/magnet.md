---
slug: magnet
name: Magnet
category: decoration
group: overlay-fx
tags: [animated]
exports: [Magnet]
status: enriched
---

# Magnet

> 指针磁吸交互组件 · 内容按「到中心距离/强度」牵引跟随指针、离开平滑归位(零依赖·reduced-motion 钳位) · decoration/overlay-fx · #animated

## 何时用

包裹单个交互元素（按钮、图标、CTA），指针靠近时内容被磁吸牵引跟随、离开平滑归位，做精致的微交互。要给整块区域做指针烟雾/图片拖尾背景用 [GhostCursor](../ghost-cursor/ghost-cursor.md) / [ImageTrail](../image-trail/image-trail.md)；本组件是「单元素跟手位移」的轻交互。继承 `HTMLAttributes<HTMLDivElement>`（除 children），可透传 div 属性。

## 导入
```ts
import { Magnet } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| padding | `number` | `100` | 感应半径（px），自元素边界向外扩展，越大越远距离感应 |
| disabled | `boolean` | `false` | 禁用磁吸：停止牵引并平滑归位原点，DOM 结构不变 |
| magnetStrength | `number` | `2` | 吸力除数，位移=指针到中心距离/此值，越小吸力越强；建议 1–6 |
| activeTransition | `string` | `"transform 0.3s ease-out"` | 吸附激活态过渡（跟随指针时） |
| inactiveTransition | `string` | `"transform 0.5s ease-in-out"` | 失活态过渡（离开归位时） |
| wrapperClassName | `string` | — | 透传外层包裹 div（定位/尺寸）额外 className |
| innerClassName | `string` | — | 透传内层位移 div（承载 transform）额外 className |
| style | `CSSProperties` | — | 透传外层包裹 div 内联样式 |

> 另继承 `Omit<HTMLAttributes<HTMLDivElement>, "children">` 的所有标准 div 属性。

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| children | `ReactNode` | 被磁吸的内容（按钮、图标、卡片等） |

## 示例
```tsx
<Magnet padding={100} magnetStrength={2}>
  <button className="rounded-full bg-primary px-6 py-3 text-primary-foreground">
    把我拉过来
  </button>
</Magnet>
```

强吸力（几乎贴住指针）：
```tsx
<Magnet padding={140} magnetStrength={1}>
  <Pill label="强磁吸" />
</Magnet>
```

## 禁忌 / 坑

- `magnetStrength` 是除数不是乘数：值越小吸力越强（=1 几乎贴住指针），别理解反了。
- reduced-motion 下位移会被钳位，交互降级，不要依赖磁吸做关键功能。

## 相关
[BorderBeam](../border-beam/border-beam.md) · [ShineBorder](../shine-border/shine-border.md) · [GlareHover](../glare-hover/glare-hover.md) · [Lens](../lens/lens.md) · [AnimatedBeam](../animated-beam/animated-beam.md) · [OrbitingCircles](../orbiting-circles/orbiting-circles.md)
