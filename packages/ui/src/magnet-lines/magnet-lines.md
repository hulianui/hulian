---
slug: magnet-lines
name: MagnetLines
category: decoration
group: overlay-fx
tags: [animated]
exports: [MagnetLines]
status: enriched
---

# MagnetLines

> 磁力线网格 · 指针驱动的磁力线网格 · rows×columns 细线段实时朝向鼠标(acos 反三角求角) + token 线色(零依赖·reduced-motion 静止) · decoration/overlay-fx · #animated

## 何时用

铺一片细线段网格，每根线段实时转向指向鼠标，做磁场/罗盘式的极简交互装饰。它是纯 CSS transform 的轻量方案（无 WebGL），相比 [GhostCursor](../ghost-cursor/ghost-cursor.md) / [LaserFlow](../laser-flow/laser-flow.md) 这类 WebGL 重背景更轻、更适合做小块图形点缀。容器为正方形，默认占 `80vmin`。

## 导入
```ts
import { MagnetLines } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| rows | `number` | `9` | 网格行数，rows×columns 即线段总数 |
| columns | `number` | `9` | 网格列数 |
| containerSize | `string` | `"80vmin"` | 容器尺寸（任意 CSS 长度），正方形，线段在其中等分铺开 |
| lineColor | `string` | `var(--color-foreground)` | 线段颜色，吃明暗主题；任意 CSS 颜色串均可 |
| lineWidth | `string` | `"1vmin"` | 单条线段宽度（任意 CSS 长度） |
| lineHeight | `string` | `"6vmin"` | 单条线段高度（任意 CSS 长度） |
| baseAngle | `number` | `-10` | 初始静止角度（度）；指针未动或 reduced-motion 时保持该角 |
| className | `string` | — | 透传根容器额外 className |
| style | `CSSProperties` | — | 透传根容器内联样式（与内部计算的 grid 样式合并，后写覆盖） |

## 示例
```tsx
<MagnetLines containerSize="16rem" lineColor="var(--color-foreground)" />
```

细密网格 + 品牌色：
```tsx
<MagnetLines
  rows={13}
  columns={13}
  containerSize="16rem"
  lineWidth="0.4rem"
  lineHeight="2rem"
  lineColor="var(--color-chart-1)"
/>
```

## 禁忌 / 坑

- `rows × columns` 即 DOM 线段节点数（默认 81 个），过大网格会拖累渲染，按需控制密度。
- reduced-motion 下所有线段固定在 `baseAngle`，不再跟随鼠标。

## 相关
[BorderBeam](../border-beam/border-beam.md) · [ShineBorder](../shine-border/shine-border.md) · [GlareHover](../glare-hover/glare-hover.md) · [Lens](../lens/lens.md) · [AnimatedBeam](../animated-beam/animated-beam.md) · [OrbitingCircles](../orbiting-circles/orbiting-circles.md)
