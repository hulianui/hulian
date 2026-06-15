---
slug: grid-motion
name: GridMotion
category: decoration
group: backdrop
tags: [animated, webgl]
exports: [GridMotion]
status: enriched
---

# GridMotion

> 倾斜网格视差背景 · 鼠标横移每行奇偶反向弹性追随 + 中心径向光晕(零依赖 motion useSpring·token·reduced-motion) · decoration/backdrop · #animated #webgl

## 何时用

需要把图片/文字/图标铺成倾斜网格、随鼠标横移产生奇偶行反向视差的 hero 背景时用。要纯几何网格底纹（无内容、无视差）用 [GridPattern](../grid-pattern/grid-pattern.md)；要带消失点的复古透视网格用 [RetroGrid](../retro-grid/retro-grid.md)。

## 导入
```ts
import { GridMotion } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| items | `ReactNode[]` | 占位文字「Item N」 | 网格单元内容。字符串以 `http` 开头视为图片 URL，否则当文字；ReactNode 直接渲染。超过 行×列 截断，不足补占位 |
| rows | `number` | `4` | 网格行数，每行为独立视差平移单元（奇偶行反向） |
| columns | `number` | `7` | 网格列数 |
| gradientColor | `string` | `var(--color-primary)` | 中心径向光晕颜色，从画布中心向外渐隐 |
| maxMoveAmount | `number` | `300` | 鼠标横移时每行最大平移幅度(px)，越大视差越夸张 |
| rotate | `number` | `-15` | 网格整体旋转角度(deg)，营造透视斜切 |
| className | `string` | — | 透传根容器 className |
| style | `CSSProperties` | — | 透传根容器内联样式 |

## 示例
```tsx
// 容器需 relative + overflow-hidden + 定高，组件用 absolute inset-0 铺满
<div className="relative h-72 overflow-hidden rounded-xl">
  <GridMotion className="absolute inset-0" />
</div>
```
```tsx
// 自定义文字 + 暖色光晕
<GridMotion
  className="absolute inset-0"
  gradientColor="var(--color-chart-1)"
  items={Array.from({ length: 28 }, (_, i) => WORDS[i % WORDS.length])}
/>
```

## 禁忌 / 坑

- 父容器必须 `relative + overflow-hidden + 定高`，组件靠 `absolute inset-0` 铺满；缺高度则不可见。
- 视差/光晕走客户端 motion `useSpring`，SSR 首帧无动画，属正常。reduced-motion 下视差降级。
- 自定义 `gradientColor` 传 CSS 变量须用带 `--color-` 前缀的 token（如 `var(--color-chart-1)`），裸 `var(--primary)` 不解析，见 [[hulian-token-color-var-needs-color-prefix]]。

## 相关
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md)
