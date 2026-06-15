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

- 自定义往按钮塞图标+文字若图标掉行，是 Tailwind Preflight `svg{display:block}` 所致，见 [[tailwind-preflight-svg-block-breaks-icon-text-in-nonflex-button]]——确保文案容器是 `inline-flex`。

## 相关
[Button](../button/button.md) · [ShimmerButton](../shimmer-button/shimmer-button.md) · [RainbowButton](../rainbow-button/rainbow-button.md) · [RippleButton](../ripple-button/ripple-button.md) · [ButtonGroup](../button-group/button-group.md) · [SocialButton](../social-button/social-button.md)
