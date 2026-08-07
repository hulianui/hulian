---
slug: pulsating-button
name: PulsatingButton
category: forms
group: button
tags: [animated]
exports: [PulsatingButton]
status: enriched
---

# PulsatingButton

> 脉冲按钮 · 外扩光环(box-shadow) + RSC · forms/button · #animated

## 何时用

用一圈外扩脉冲光环引导用户注意的 CTA（订阅、提交等）。普通操作用 [Button](../button/button.md)；边缘游走火花用 [ShimmerButton](../shimmer-button/shimmer-button.md)；彩虹流光底用 [RainbowButton](../rainbow-button/rainbow-button.md)。

## 导入
```ts
import { PulsatingButton } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| size | `"sm" ｜ "md" ｜ "lg"` | `"md"` | 尺寸档，与 Button 同刻度（32/40/48px 高） |
| pulseColor | `string` | `var(--color-primary)` 的 70% | 脉冲光环色 |
| duration | `string` | `1.5s` | 一轮脉冲秒数 |
| ...buttonProps | `ComponentPropsWithoutRef<"button">` | — | 透传原生 button 属性 |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onClick | `(e: MouseEvent<HTMLButtonElement>) => void` | 点击回调，经 `ComponentPropsWithoutRef<"button">` 透传 |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| children | `ReactNode` | 按钮文案，经原生 button 属性透传 |

## 示例
```tsx
<PulsatingButton>立即订阅</PulsatingButton>

// 放慢脉冲
<PulsatingButton duration="2.5s">立即订阅</PulsatingButton>
```

## 禁忌 / 坑

- **与 [Button](../button/button.md) 共享底座**：排布、`size` 三档（32/40/48px 高）、焦点环、禁用态视觉、`forwardRef` 都来自同一份 `EFFECT_BUTTON_BASE_CLASS` + `BUTTON_SIZE_CLASS`。**不共享的是配色与圆角**——底色是本件自己的特效层。所以它与普通 Button 混排等高，焦点样式也和全库一致（0.27.0 前四个特效件各写各的，这些全缺，`px-6 py-3` 按内容撑高，工具栏里一排按钮会参差，见 #126）。

- 自定义往按钮塞图标+文字若图标掉行，是 Tailwind Preflight `svg{display:block}` 所致，见 [[tailwind-preflight-svg-block-breaks-icon-text-in-nonflex-button]]——确保文案容器是 `inline-flex`。

## 相关
[Button](../button/button.md) · [ShimmerButton](../shimmer-button/shimmer-button.md) · [RainbowButton](../rainbow-button/rainbow-button.md) · [RippleButton](../ripple-button/ripple-button.md) · [ButtonGroup](../button-group/button-group.md) · [SocialButton](../social-button/social-button.md)
