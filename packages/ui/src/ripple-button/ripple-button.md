---
slug: ripple-button
name: RippleButton
category: forms
group: button
tags: [animated]
exports: [RippleButton]
status: enriched
---

# RippleButton

> 波纹按钮 · 点击落点扩散(Material) + reduced-motion · forms/button · #animated

## 何时用

需要 Material 风格「点击落点扩散波纹」反馈的按钮。普通操作用 [Button](../button/button.md)；只想要视觉特效（流光/彩虹/脉冲）而非点击涟漪时用 [ShimmerButton](../shimmer-button/shimmer-button.md) / [RainbowButton](../rainbow-button/rainbow-button.md) / [PulsatingButton](../pulsating-button/pulsating-button.md)。

## 导入
```ts
import { RippleButton } from "@hulianui/ui"
```

## Props

继承全部原生 `<button>` 属性（`disabled`/`type`…）。

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| size | `"sm" ｜ "md" ｜ "lg"` | `"md"` | 尺寸档，与 Button 同刻度（32/40/48px 高） |
| rippleColor | `string` | `var(--color-primary-foreground)` | 波纹颜色 |
| duration | `string` | `"600ms"` | 单次波纹动画时长 |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onClick | `(e: MouseEvent<HTMLButtonElement>) => void` | 透传原生点击回调（点击同时触发波纹扩散） |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| children | `ReactNode` | 按钮内容（文案/图标） |

## 示例
```tsx
<RippleButton>点我看波纹</RippleButton>
```
```tsx
<RippleButton duration="900ms">点我看波纹</RippleButton>
```

## 禁忌 / 坑

- **与 [Button](../button/button.md) 共享底座**：排布、`size` 三档（32/40/48px 高）、焦点环、禁用态视觉、`forwardRef` 都来自同一份 `EFFECT_BUTTON_BASE_CLASS` + `BUTTON_SIZE_CLASS`。**不共享的是配色与圆角**——底色是本件自己的特效层。所以它与普通 Button 混排等高，焦点样式也和全库一致（0.27.0 前四个特效件各写各的，这些全缺，`px-6 py-3` 按内容撑高，工具栏里一排按钮会参差，见 #126）。

暂无已知坑。波纹动画在 `prefers-reduced-motion: reduce` 下自动抑制，无需手动处理。

## 相关
[Button](../button/button.md) · [ShimmerButton](../shimmer-button/shimmer-button.md) · [RainbowButton](../rainbow-button/rainbow-button.md) · [PulsatingButton](../pulsating-button/pulsating-button.md) · [ButtonGroup](../button-group/button-group.md) · [SocialButton](../social-button/social-button.md)
