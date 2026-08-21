---
slug: interactive-hover-button
name: InteractiveHoverButton
category: forms
group: button
tags: [animated]
exports: [InteractiveHoverButton]
status: enriched
---

# InteractiveHoverButton

> 悬停展开按钮 · 圆点扩成整块底色 + 尾随箭头 CTA · forms/button · #animated

## 何时用

落地页 / 官网首屏的**主 CTA**。静息是「小圆点 + 文案」的轻量胶囊，悬停或聚焦时圆点扩成整块底色、文案换成「文案 + 箭头」，把「这里是要点的那一个」说清楚。

一页只放一枚：它靠的是与周围克制元素的反差。次级动作用 [Button](../button/button.md)（`variant="outline"` / `"ghost"`）。要边缘游走的火花用 [ShimmerButton](../shimmer-button/shimmer-button.md)，要呼吸脉冲用 [PulsatingButton](../pulsating-button/pulsating-button.md)，要点击水波用 [RippleButton](../ripple-button/ripple-button.md)。中后台**不要**用这一族。

## 导入
```ts
import { InteractiveHoverButton } from "@hulianui/ui"
```

## Props

继承原生 `<button>` 属性（如 `onClick` / `disabled` / `type`…）。

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| size | `"sm" ｜ "md" ｜ "lg"` | `"md"` | 尺寸档，与 [Button](../button/button.md) 一一对应（32 / 40 / 48px 高），可与普通按钮混排等高 |
| background | `string` | `var(--color-primary)` | 展开后的底色 |
| foreground | `string` | `var(--color-primary-foreground)` | 展开后的文字色 |
| dotColor | `string` | 跟随 `background` | 静息态那颗小圆点的颜色 |
| duration | `string` | `"0.4s"` | 展开动画时长 |
| icon | `ReactNode` | 右箭头 | 悬停层右侧的尾随图标；传 `null` 去掉 |
| render | `ReactElement` | - | 渲染为自定义元素（如 `<a>` / Next `<Link>`）而非 `<button>`，用于「落地页主 CTA 是个链接」。样式与内部两层结构会合并进该元素，文案仍取 `children` |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| children | `ReactNode` | 按钮文案。静息层与悬停层各渲染一份，悬停层整层 `aria-hidden`，所以可访问名只有一份 |

## 示例
```tsx
<InteractiveHoverButton>开始使用</InteractiveHoverButton>
```
```tsx
{/* 换配色（建议喂 chart token 以吃明暗主题） */}
<InteractiveHoverButton background="var(--color-chart-2)">立即体验</InteractiveHoverButton>
```
```tsx
{/* 落地页主 CTA 往往是链接 */}
<InteractiveHoverButton render={<a href="/docs" />}>阅读文档</InteractiveHoverButton>
```

## 禁忌 / 坑

- **别把它当普通按钮铺开用。** 中后台一屏几十个操作，这枚按钮的展开动画会变成噪音；它的语义是「整页最重要的那一个动作」。
- 展开用的是 `clip-path: circle(150% …)` 而不是缩放一颗圆点。上游那个 `scale(100.8)` 是按某个按钮宽度反推出来的魔数——**按钮再宽一点就盖不满**（长文案、中文两行、`lg` 档），边角露出静息底色，而且是静默失败，只有实机看才发现。这里的百分比按参照框对角线解析，任何宽度都必然铺满。
- **焦点态与悬停态同步展开**。键盘用户看不到 hover；少了这条，Tab 过来就只剩一个焦点环，读不出「这是主 CTA」。改样式时别把 `group-focus-visible:` 那条一起删掉。
- 悬停层里的文案是第二份副本，整层已 `aria-hidden`。往里塞可聚焦元素（链接、按钮）会造出读屏拿不到、键盘也 Tab 不进的死角。
- 自定义 `background` 时核对与 `foreground` 的对比度：默认这对是 primary / primary-foreground，换了底色不换字色可能不达标。

## 相关
[Button](../button/button.md) · [ShimmerButton](../shimmer-button/shimmer-button.md) · [RainbowButton](../rainbow-button/rainbow-button.md) · [PulsatingButton](../pulsating-button/pulsating-button.md) · [RippleButton](../ripple-button/ripple-button.md)
