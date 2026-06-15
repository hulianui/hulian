---
slug: glass-icons
name: GlassIcons
category: decoration
group: overlay-fx
tags: [animated]
exports: [GlassIcons]
status: enriched
---

# GlassIcons

> 玻璃拟态图标按钮网格 · 背面 3D 旋转彩色发光板 + 前面磨砂玻璃片（backdrop-blur·inset 高光边），hover/focus 彩板抬升旋转、玻璃前推、标签滑出（纯 CSS 零依赖·token 配色·RSC 安全·reduced-motion） · decoration/overlay-fx · #animated

## 何时用

需要一组玻璃拟态、带 3D 抬升发光交互的图标按钮网格（如功能入口/分类导航/快捷操作）时用。要给单个元素加边框光带用 [BorderBeam](../border-beam/border-beam.md)/[ShineBorder](../shine-border/shine-border.md)；要做眩光悬停用 [GlareHover](../glare-hover/glare-hover.md)。GlassIcons 是「一组带标签的可点图标」，自带无障碍名。

## 导入
```ts
import { GlassIcons } from "@hulianui/ui"
```

## Props

### GlassIconsProps

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| items* | `GlassIconItem[]` | — | 图标项列表，按网格依次渲染为玻璃按钮 |
| columns | `number` | `3` | 网格列数，窄屏自动回落到更少列 |
| className | `string` | — | 透传根网格容器 className（可覆盖列数/间距/对齐） |
| style | `CSSProperties` | — | 透传根容器内联样式 |

### GlassIconItem

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| icon* | `ReactNode` | — | 图标节点（通常 lucide-react），渲染于玻璃前层中央，`aria-hidden` |
| label* | `string` | — | hover/focus 滑出的文字，同时作按钮 `aria-label` |
| color | `string` | `"primary"` | 背面发光配色，预设名 `primary｜blue｜purple｜red｜indigo｜orange｜green`，或任意 CSS 颜色/渐变 |
| className | `string` | — | 透传该按钮 className |
| onClick | `() => void` | — | 点击回调 |

## 示例

```tsx
import { Heart, Star, Bell } from "lucide-react";

<GlassIcons
  columns={3}
  items={[
    { icon: <Heart />, label: "收藏", color: "red" },
    { icon: <Star />, label: "星标", color: "orange" },
    { icon: <Bell />, label: "通知", color: "blue" },
  ]}
/>

// 自定义渐变色
<GlassIcons
  columns={2}
  items={[
    { icon: <Cloud />, label: "极光", color: "linear-gradient(135deg, var(--color-chart-1), var(--color-chart-4))" },
  ]}
/>
```

## 禁忌 / 坑

- `label` 既是滑出文字也是 `aria-label`，必填，不要为视觉留空——否则按钮失去无障碍名。
- 玻璃发光在深色背景上才清晰，浅底下效果弱；`color` 喂 token/渐变时务必带 `--color-` 前缀。
- 容器需 `overflow-visible`，否则 3D 抬升与标签滑出会被裁切。

## 相关
[BorderBeam](../border-beam/border-beam.md) · [ShineBorder](../shine-border/shine-border.md) · [GlareHover](../glare-hover/glare-hover.md) · [Lens](../lens/lens.md) · [AnimatedBeam](../animated-beam/animated-beam.md) · [OrbitingCircles](../orbiting-circles/orbiting-circles.md)
