---
slug: star-border
name: StarBorder
category: decoration
group: overlay-fx
tags: [animated]
exports: [StarBorder]
status: enriched
---

# StarBorder

> 流星描边按钮 · 上下两道 radial-gradient 光带沿边沿来回扫过(纯 CSS·零依赖·RSC 安全)，光带色走 token、内壳 bg-surface/border-border，多态 as + reduced-motion 自动停。 · decoration/overlay-fx · #animated

## 何时用

需要一个会发光描边、吸引点击的 CTA 按钮/链接时用。相比 [BorderBeam](../border-beam/border-beam.md)/[ShineBorder](../shine-border/shine-border.md) 这类「给任意卡片容器加边框光效」的包裹件，StarBorder 自带按钮语义（默认渲染 `<button>`、内壳就是按钮皮），直接当按钮用；如果只想给一块已有内容描边发光、不需要按钮，用 ShineBorder/BorderBeam。

## 导入
```ts
import { StarBorder } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| as | `ElementType` | `"button"` | 渲染根标签，可传 `"a"`/`"div"`/任意组件；DOM 属性透传到该元素 |
| color | `string` | `var(--color-primary)` | 流星光带颜色，喂进 radial-gradient；任意 CSS 颜色（hex/oklch/var(--…)）均可 |
| speed | `number` | `6` | 单趟流星扫过时长（秒），越大越慢越克制 |
| thickness | `number` | `1` | 边框光带厚度（px），撑开根容器上下内边距决定描边粗细 |
| className | `string` | - | 透传根容器额外类名（合并，可覆盖圆角/间距） |
| style | `CSSProperties` | - | 透传根容器内联样式 |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| children | `ReactNode` | 按钮/容器内容 |

## 示例
```tsx
// 主色光带按钮
<StarBorder>立即开始</StarBorder>

// 多态：渲染成链接，自定义色 + 加快
<StarBorder as="a" href="/docs" color="var(--color-chart-2)" speed={3}>
  查看文档 →
</StarBorder>
```

## 禁忌 / 坑

- 自定义 `color` 走 token 时务必带 `--color-` 前缀（如 `var(--color-chart-3)`），裸 `var(--primary)` 在 Tailwind v4 下不解析。见 [[hulian-token-color-var-needs-color-prefix]]。
- reduced-motion 下光带自动停（不动但描边仍在），无需额外处理。

## 相关
[BorderBeam](../border-beam/border-beam.md) · [ShineBorder](../shine-border/shine-border.md) · [GlareHover](../glare-hover/glare-hover.md) · [Lens](../lens/lens.md) · [AnimatedBeam](../animated-beam/animated-beam.md) · [OrbitingCircles](../orbiting-circles/orbiting-circles.md)
