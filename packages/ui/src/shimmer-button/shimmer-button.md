---
slug: shimmer-button
name: ShimmerButton
category: forms
group: button
tags: [animated]
exports: [ShimmerButton]
status: enriched
---

# ShimmerButton

> 微光按钮 · 边缘游走火花(conic) + token + RSC · forms/button · #animated

## 何时用

需要吸睛的主 CTA，边缘有一道游走的 conic 火花高光。普通操作用 [Button](../button/button.md)；彩虹流光底用 [RainbowButton](../rainbow-button/rainbow-button.md)；外扩脉冲光环用 [PulsatingButton](../pulsating-button/pulsating-button.md)。

## 导入
```ts
import { ShimmerButton } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| size | `"sm" ｜ "md" ｜ "lg"` | `"md"` | 尺寸档，与 Button 同刻度（32/40/48px 高） |
| shimmerColor | `string` | 跟随 `foreground` | 火花高光色，缺省读 `--hulian-shimmer-fg`（即 `foreground`） |
| shimmerSize | `string` | `0.05em` | 火花宽度 |
| borderRadius | `string` | `var(--radius)` | 圆角 |
| shimmerDuration | `string` | `3s` | 一轮火花秒数 |
| background | `string` | `var(--color-primary)` | 按钮底色 |
| foreground | `string` | `var(--color-primary-foreground)` | 文字前景色（#288），与 `background` 成对：默认两者都随主题；传了**固定**底色（如不随主题的品牌渐变）就配一个固定前景，否则暗色下渐变上出黑字。落 `--hulian-shimmer-fg`，火花色缺省也读它 |
| ...buttonProps | `ComponentPropsWithoutRef<"button">` | — | 透传原生 button 属性 |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onClick | `(e: MouseEvent<HTMLButtonElement>) => void` | 点击回调，经 `ComponentPropsWithoutRef<"button">` 透传 |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| children | `ReactNode` | 按钮文案，经原生 button 属性透传 |
| render | `ReactElement` | 渲染为自定义元素（如 `<a>`/Next `<Link>`），样式/内部火花结构合并进该元素；文案仍取 children |

## 示例
```tsx
<ShimmerButton>开始使用 瑚琏</ShimmerButton>

// 换底色
<ShimmerButton background="var(--color-danger)" foreground="var(--color-danger-foreground)">删除</ShimmerButton>
// 固定品牌渐变（不随主题）：前景也要固定，否则暗色主题下 primary-foreground 变近黑，紫渐变上出黑字
<ShimmerButton background="linear-gradient(135deg,#7c3aed,#4f46e5)" foreground="#fff">开始使用</ShimmerButton>
```

## 禁忌 / 坑

- **与 [Button](../button/button.md) 共享底座**：排布、`size` 三档（32/40/48px 高）、焦点环、禁用态视觉、`forwardRef` 都来自同一份 `EFFECT_BUTTON_BASE_CLASS` + `BUTTON_SIZE_CLASS`。**不共享的是配色与圆角**——底色是本件自己的特效层。所以它与普通 Button 混排等高，焦点样式也和全库一致（0.27.0 前四个特效件各写各的，这些全缺，`px-6 py-3` 按内容撑高，工具栏里一排按钮会参差，见 #126）。

- 颜色类 prop 应传 token CSS 变量（如 `var(--color-danger)`）以随主题切换，别硬编码裸色值。
- 自定义往按钮塞图标+文字若图标掉行，是 Tailwind Preflight `svg{display:block}` 所致，见 [[tailwind-preflight-svg-block-breaks-icon-text-in-nonflex-button]]——确保文案容器是 `inline-flex`。

## 相关
[Button](../button/button.md) · [RainbowButton](../rainbow-button/rainbow-button.md) · [PulsatingButton](../pulsating-button/pulsating-button.md) · [RippleButton](../ripple-button/ripple-button.md) · [ButtonGroup](../button-group/button-group.md) · [SocialButton](../social-button/social-button.md)
