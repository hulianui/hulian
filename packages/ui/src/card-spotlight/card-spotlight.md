---
slug: card-spotlight
name: CardSpotlight
category: decoration
group: overlay-fx
tags: [animated]
exports: [CardSpotlight]
status: enriched
---

# CardSpotlight

> 聚光卡片 · 鼠标跟随径向高光(纯 CSS 变量 + radial-gradient) + color-mix 高光色 + surface token(零依赖) · decoration/overlay-fx · #animated

## 何时用

包裹特性卡 / 作品卡 / 定价卡等内容，鼠标悬停时跟随出现一束柔和径向高光，增强可交互的「活」感。聚光锚在卡片自身、随指针移动；要做整页鼠标跟随的边框走光用 [BorderBeam](../border-beam/border-beam.md)，要做悬停时整面眩光扫过用 [GlareHover](../glare-hover/glare-hover.md)，要做局部内容放大用 [Lens](../lens/lens.md)。

## 导入
```ts
import { CardSpotlight } from "@hulianui/ui"
```

## Props

继承 `HTMLAttributes<HTMLDivElement>`（`className`、`style`、`onClick` 等照常透传）。

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| radius | `number` | `350` | 聚光灯半径(px)，越大高光扩散越广，越小越聚焦。 |
| color | `string` | chart-1 token | 聚光高光色，接受任意 CSS 颜色串，如 `"#7c3aed"`、`"var(--color-primary)"`。 |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| children* | `ReactNode` | 卡片内容。 |

## 示例
```tsx
<CardSpotlight color="var(--color-primary)" radius={350} className="w-64">
  <div className="mb-3 text-3xl">⚡</div>
  <h3 className="mb-1.5 text-base font-semibold">主题色高光</h3>
  <p className="text-sm text-muted-foreground">color 传 var(--color-primary)，高光随主题联动。</p>
</CardSpotlight>
```

## 禁忌 / 坑

- `color` 若要随主题联动，传 CSS 变量时务必带 `--color-` 前缀（如 `var(--color-primary)`），裸 `var(--primary)` 在 Tailwind v4 `@theme` 下不解析。
- 高光是指针跟随的客户端效果，纯 SSR / 无指针（触屏）环境下不显示高光，属预期降级。

## 相关
[BorderBeam](../border-beam/border-beam.md) · [ShineBorder](../shine-border/shine-border.md) · [GlareHover](../glare-hover/glare-hover.md) · [Lens](../lens/lens.md) · [AnimatedBeam](../animated-beam/animated-beam.md) · [OrbitingCircles](../orbiting-circles/orbiting-circles.md)
