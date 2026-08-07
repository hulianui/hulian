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
| size | `"sm" \| "md" \| "lg"` | `"md"` | Size step, on the same 32/40/48px scale as Button. |
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

- **Shares its base with [Button](../button/button.md).** Layout, the three `size` steps (32/40/48px tall), the focus ring, the disabled treatment, and `forwardRef` all come from the same `EFFECT_BUTTON_BASE_CLASS` and `BUTTON_SIZE_CLASS`. **Colour and corner radius are deliberately not shared**, since the background is this component's own effect layer. As a result it lines up with regular Buttons and matches the library-wide focus style; before 0.27.0 each effect button rolled its own markup, lacked all of the above, and sized itself with `px-6 py-3`, so a toolbar row came out uneven (#126).

The ripple animation is automatically suppressed under `prefers-reduced-motion: reduce`; consumers do not need to add a separate motion check.

## Related
[Button](../button/button.md) · [ShimmerButton](../shimmer-button/shimmer-button.md) · [RainbowButton](../rainbow-button/rainbow-button.md) · [PulsatingButton](../pulsating-button/pulsating-button.md) · [ButtonGroup](../button-group/button-group.md) · [SocialButton](../social-button/social-button.md)
