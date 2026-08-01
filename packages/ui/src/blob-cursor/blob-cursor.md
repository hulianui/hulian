---
slug: blob-cursor
name: BlobCursor
category: decoration
group: overlay-fx
tags: [animated]
exports: [BlobCursor]
status: enriched
---

# BlobCursor

> 果冻光标 · 拖尾组件 · 领头跟手 + 多滴弹性拖尾经 SVG gooey 滤镜融成液态水银(去 gsap·motion useSpring·token·reduced-motion) · decoration/overlay-fx · #animated

## 何时用

需要光标本身呈液态水银/果冻形态、移动时多滴弹性拖尾融合（趣味 hero、创意落地页）时用。它做的是「光标形态」；要光标在容器内落下字形拖尾用 [TextCursor](../text-cursor/text-cursor.md)，要满屏粒子吸附背景用 [Antigravity](../antigravity/antigravity.md)，要准星十字线用 [Crosshair](../crosshair/crosshair.md)。

## 导入
```ts
import { BlobCursor } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| trailCount | `number` | `3` | 拖尾水滴数量（含领头）；越多越黏稠 |
| sizes | `number[]` | `[56, 116, 72]` | 各水滴直径（px），按索引取用、不足循环 |
| innerSizes | `number[]` | `[18, 32, 22]` | 各水滴内部高光点直径（px），同样循环复用 |
| fillColor | `string` | `var(--color-primary)` | 水滴主体填充色，可传任意 CSS 颜色 |
| innerColor | `string` | `var(--color-primary-foreground)` | 内部高光点颜色 |
| square | `boolean` | `false` | 是否方形水滴（false=圆形）；方形配 gooey 得液态方块 |
| gooey | `boolean` | `true` | 是否启用 SVG gooey 融合滤镜；关则各水滴独立 |
| gooeyStrength | `number` | `16` | gooey 高斯模糊标准差，越大融合范围越广、边缘越软 |
| leadStiffness | `number` | `500` | 领头水滴跟手弹簧刚度（越大越跟手） |
| trailStiffness | `number` | `120` | 拖尾水滴弹簧刚度（越小拖尾越长） |
| damping | `number` | `28` | 弹簧阻尼（越大越不回弹、越黏） |
| zIndex | `number` | `50` | 容器层级；水滴层不拦截指针（pointer-events:none） |
| className | `string` | — | 透传到根容器（relative，铺满父级） |
| style | `CSSProperties` | — | 透传到根容器内联样式 |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| children | `ReactNode` | 覆盖在水滴上方的内容（relative z-10） |

## 示例
```tsx
// 默认：移入舞台见果冻跟随
<div className="relative h-64 overflow-hidden rounded-xl">
  <BlobCursor>
    <div className="pointer-events-none flex h-full items-center justify-center">
      移动鼠标 →
    </div>
  </BlobCursor>
</div>

// 长拖尾（5 滴 · 低刚度更拖泥带水）
<BlobCursor trailCount={5} trailStiffness={70} />
```

## 禁忌 / 坑

- 客户端组件：根容器 relative 铺满父级，父级须有明确高度且 `overflow-hidden`。
- `sizes`/`innerSizes` 数组长度建议 ≥ `trailCount`，不足时按索引循环复用，不会报错但配色/尺寸会重复。
- `gooey` 关闭后水滴各自独立、不再融合，方形水滴失去液态块观感。
- 水滴层 `pointer-events:none`，不拦截下层交互；要在其上叠内容用 `children`（自带 z-10）。

## 相关
[BorderBeam](../border-beam/border-beam.md) · [ShineBorder](../shine-border/shine-border.md) · [GlareHover](../glare-hover/glare-hover.md) · [Lens](../lens/lens.md) · [AnimatedBeam](../animated-beam/animated-beam.md) · [OrbitingCircles](../orbiting-circles/orbiting-circles.md)
