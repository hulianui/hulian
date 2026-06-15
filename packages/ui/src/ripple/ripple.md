---
slug: ripple
name: Ripple
category: decoration
group: backdrop
tags: [animated]
exports: [Ripple]
status: enriched
---

# Ripple

> 同心脉冲圆环 · CSS 逐圈延迟 + reduced-motion · decoration/backdrop · #animated

## 何时用

中心向外扩散的同心脉冲（雷达扫描、信号广播、CTA 焦点氛围）。要脉冲圆环用本组件；要静态径向辉光用 [Spotlight](../spotlight/spotlight.md)，要规整纹理用 [DotPattern](../dot-pattern/dot-pattern.md) / [GridPattern](../grid-pattern/grid-pattern.md)。

## 导入
```ts
import { Ripple } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| mainCircleSize | `number` | `210` | 最内圈直径 px |
| mainCircleOpacity | `number` | `0.24` | 最内圈不透明度 |
| numCircles | `number` | `8` | 圈数 |

> 继承 `ComponentPropsWithoutRef<"div">`。颜色取 `currentColor`，用 `text-*` 工具类控制。

## 示例
```tsx
<div className="relative grid place-items-center overflow-hidden">
  <Ripple mainCircleSize={160} />
</div>

<Ripple mainCircleSize={140} numCircles={5} className="text-primary" />
```

## 禁忌 / 坑

- 内部 `absolute inset-0` 铺满父级，须放在 `relative` 定位容器内，通常配 `grid place-items-center` 让脉冲从内容中心扩散。
- 含逐圈延迟的 CSS 动画，已内置 `prefers-reduced-motion` 降级。

## 相关
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Meteors](../meteors/meteors.md)
