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

继承全部原生 `<button>` 属性（`onClick`/`disabled`/`type`…）。

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| rippleColor | `string` | `var(--color-primary-foreground)` | 波纹颜色 |
| duration | `string` | `"600ms"` | 单次波纹动画时长 |

## 示例
```tsx
<RippleButton>点我看波纹</RippleButton>
```
```tsx
<RippleButton duration="900ms">点我看波纹</RippleButton>
```

## 禁忌 / 坑

暂无已知坑。波纹动画在 `prefers-reduced-motion: reduce` 下自动抑制，无需手动处理。

## 相关
[Button](../button/button.md) · [ShimmerButton](../shimmer-button/shimmer-button.md) · [RainbowButton](../rainbow-button/rainbow-button.md) · [PulsatingButton](../pulsating-button/pulsating-button.md) · [ButtonGroup](../button-group/button-group.md) · [SocialButton](../social-button/social-button.md)
