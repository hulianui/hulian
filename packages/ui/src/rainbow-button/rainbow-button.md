---
slug: rainbow-button
name: RainbowButton
category: forms
group: button
tags: [animated]
exports: [RainbowButton]
status: enriched
---

# RainbowButton

> 彩虹按钮 · chart 流光底 + 模糊光晕 + RSC · forms/button · #animated

## 何时用

需要最强吸睛的英雄 CTA，底部 chart 色彩流动 + 模糊光晕。普通操作用 [Button](../button/button.md)；单道边缘火花用 [ShimmerButton](../shimmer-button/shimmer-button.md)；外扩脉冲光环用 [PulsatingButton](../pulsating-button/pulsating-button.md)。

## 导入
```ts
import { RainbowButton } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| speed | `string` | `3s` | 彩虹流动一轮秒数 |
| ...buttonProps | `ComponentPropsWithoutRef<"button">` | — | 透传原生 button 属性（onClick、children 等） |

## 示例
```tsx
<RainbowButton>Get Started</RainbowButton>

// 放慢流动
<RainbowButton speed="5s">Get Started</RainbowButton>
```

## 禁忌 / 坑

- 自定义往按钮塞图标+文字若图标掉行，是 Tailwind Preflight `svg{display:block}` 所致，见 [[tailwind-preflight-svg-block-breaks-icon-text-in-nonflex-button]]——确保文案容器是 `inline-flex`。

## 相关
[Button](../button/button.md) · [ShimmerButton](../shimmer-button/shimmer-button.md) · [PulsatingButton](../pulsating-button/pulsating-button.md) · [RippleButton](../ripple-button/ripple-button.md) · [ButtonGroup](../button-group/button-group.md) · [SocialButton](../social-button/social-button.md)
