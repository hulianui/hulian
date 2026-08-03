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

> Material-style button · ripple expands from the click position + reduced-motion support · forms/button · #animated

## When to use

Use RippleButton when an action needs Material-style feedback that expands from the pointer position. Use [Button](../button/button.md) for ordinary actions, or [ShimmerButton](../shimmer-button/shimmer-button.md), [RainbowButton](../rainbow-button/rainbow-button.md), or [PulsatingButton](../pulsating-button/pulsating-button.md) for continuous visual emphasis rather than click feedback.

## Import
```ts
import { RippleButton } from "@hulianui/ui"
```

## Props

Accepts all native `<button>` props, including `disabled` and `type`.

| Name | Type | Default | Description |
|------|------|------|------|
| rippleColor | `string` | `var(--color-primary-foreground)` | Ripple color. |
| duration | `string` | `"600ms"` | Duration of one ripple animation. |

## Events

| Event | Type | Description |
|------|------|------|
| onClick | `(e: MouseEvent<HTMLButtonElement>) => void` | Transparently transmit native click callback (click triggers ripple diffusion at the same time) |

## Slots

| Slot | Type | Description |
|------|------|------|
| children | `ReactNode` | Button content (copy/icon) |

## Example
```tsx
<RippleButton>Show ripple</RippleButton>
```
```tsx
<RippleButton duration="900ms">Show slow ripple</RippleButton>
```

## Usage guidelines

The ripple animation is automatically suppressed under `prefers-reduced-motion: reduce`; consumers do not need to add a separate motion check.

## Related
[Button](../button/button.md) · [ShimmerButton](../shimmer-button/shimmer-button.md) · [RainbowButton](../rainbow-button/rainbow-button.md) · [PulsatingButton](../pulsating-button/pulsating-button.md) · [ButtonGroup](../button-group/button-group.md) · [SocialButton](../social-button/social-button.md)
