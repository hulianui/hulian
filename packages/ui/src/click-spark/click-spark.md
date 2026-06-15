---
slug: click-spark
name: ClickSpark
category: decoration
group: overlay-fx
tags: [animated]
exports: [ClickSpark]
status: enriched
---

# ClickSpark

> 点击迸发火花的交互背景包裹器 · 点击点放射一圈短线段沿角度缓动飞散 + 数量/半径/长度/时长/缓动全可调（canvas2d+RAF 零依赖·token 取色·reduced-motion 静默·RSC 安全·jsdom 安全） · decoration/overlay-fx · #animated

## 何时用

需要在某区域内任意点击处迸发一圈放射火花（按钮区、卡片、互动 hero）时用——它是包裹器，包住的内容点击即放火花。要光标果冻拖尾用 [BlobCursor](../blob-cursor/blob-cursor.md)，要满屏粒子吸附用 [Antigravity](../antigravity/antigravity.md)，要准星十字线用 [Crosshair](../crosshair/crosshair.md)。

## 导入
```ts
import { ClickSpark } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| sparkColor | `string` | `var(--color-foreground)` | 火花颜色（自动吃明暗主题），可传任意 CSS 颜色 |
| sparkSize | `number` | `10` | 单条火花线段初始长度（px），越大越粗犷 |
| sparkRadius | `number` | `15` | 火花飞散最大半径（px），决定爆发范围 |
| sparkCount | `number` | `8` | 一次点击放射的火花数量（均分 360°） |
| duration | `number` | `400` | 单次火花动画时长（ms），越大越拖尾 |
| easing | `"linear" \| "ease-in" \| "ease-out" \| "ease-in-out"` | `"ease-out"` | 火花飞出缓动曲线 |
| extraScale | `number` | `1` | 半径额外缩放系数，>1 放大爆发、<1 收敛 |
| className | `string` | — | 透传到根容器（relative DOM 元素） |
| style | `CSSProperties` | — | 透传到根容器内联样式 |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| children | `ReactNode` | 包裹内容，点击其内任意位置都在点击点迸发火花 |

## 示例
```tsx
// 默认：前景色火花，点击区域任意处放射
<div className="relative h-56 overflow-hidden rounded-xl">
  <ClickSpark className="absolute inset-0">
    <div className="flex h-full items-center justify-center">点击此处放射火花</div>
  </ClickSpark>
</div>

// 大爆发（多火花 + 长线段 + 大半径 + token 取色）
<ClickSpark sparkColor="var(--color-chart-1)" sparkCount={16} sparkSize={18} sparkRadius={36}>
  <Hint />
</ClickSpark>
```

## 禁忌 / 坑

- `sparkColor` 用 token 必须带 `--color-` 前缀（`var(--color-foreground)`），canvas strokeStyle 喂裸 `var(--foreground)` 不解析。见 [[hulian-token-color-var-needs-color-prefix]]。
- 是包裹器：火花只在包住的 `children` 区域内点击触发；根容器须为定位上下文（relative）。
- reduced-motion 下静默不放火花；RSC/jsdom 环境安全（不报错），但实际火花需浏览器运行时。

## 相关
[BorderBeam](../border-beam/border-beam.md) · [ShineBorder](../shine-border/shine-border.md) · [GlareHover](../glare-hover/glare-hover.md) · [Lens](../lens/lens.md) · [AnimatedBeam](../animated-beam/animated-beam.md) · [OrbitingCircles](../orbiting-circles/orbiting-circles.md)
