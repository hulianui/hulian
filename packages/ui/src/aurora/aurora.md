---
slug: aurora
name: Aurora
category: decoration
group: backdrop
tags: [animated]
exports: [Aurora]
status: enriched
---

# Aurora

> 极光渐变背景 · 双层 repeating-linear-gradient 横移干涉 + 径向 mask 聚焦 + chart token(纯 CSS·RSC) · decoration/backdrop · #animated

## 何时用

需要柔和流动的彩色渐变背景（Hero / 登录页 / 营销区块）时用。纯 CSS 实现、可作为 RSC 直接服务端渲染、无 canvas/WebGL 开销，是首选的低成本动态背景；若要逐颗粒子或鼠标交互，用 [Particles](../particles/particles.md)；若要质感更强的丝绸/虹彩光泽，用 [Silk](../silk/silk.md) / [Iridescence](../iridescence/iridescence.md)（但它们依赖 WebGL）。

## 导入
```ts
import { Aurora } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| colors | string[] | `["var(--color-chart-1)","var(--color-chart-2)","var(--color-chart-4)"]` | 极光色带，任意 CSS 颜色字符串（hex/oklch/var）。默认吃 chart token 自动明暗适配 |
| blur | number | 30 | 极光层模糊半径（px），建议 10–80；过小边缘硬，过大效果消散 |
| speed | number | 20 | 完整一轮动画时长（秒），越大越慢越细腻 |
| showRadialMask | boolean | true | 径向渐隐 mask（聚焦中部四角淡出），关闭则铺满容器无渐隐 |
| className | string | — | 透传到极光层 div（可调透明度/混合模式） |
| children | ReactNode | — | 覆盖在极光上方的内容（relative 层叠） |
| style | CSSProperties | — | 透传到根容器的内联样式 |

## 示例
```tsx
// 深色底上叠极光，内容层用 relative 自然层叠在背景之上
<div className="relative h-56 overflow-hidden rounded-xl">
  <Aurora className="absolute inset-0 opacity-80">
    <div className="flex h-full items-center justify-center text-white/80">Aurora</div>
  </Aurora>
</div>
```
```tsx
// 自定义暖橙色带 + 更慢更柔
<Aurora
  colors={["var(--color-chart-3)", "var(--color-chart-1)", "oklch(0.72 0.22 30)"]}
  blur={40}
  speed={25}
  className="absolute inset-0 opacity-75"
/>
```

## 禁忌 / 坑

- 父容器需 `relative` + `overflow-hidden`，否则横移的渐变层会溢出。
- 极光透明度建议靠 `className` 上的 `opacity-*` 控制（showcase 全用 `opacity-60~90`）；直接铺满不透明会盖死下层内容。

## 相关
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md)
