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

> Pulsating button · expanding `box-shadow` halo · RSC-safe · forms/button · #animated

## When to use

Use PulsatingButton for a CTA that needs extra emphasis through an expanding halo, such as Subscribe or Submit. Use [Button](../button/button.md) for ordinary actions, [ShimmerButton](../shimmer-button/shimmer-button.md) for an animated edge highlight, or [RainbowButton](../rainbow-button/rainbow-button.md) for a multicolor flowing background.

## Import
```ts
import { PulsatingButton } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| pulseColor | `string` | 70% of `var(--color-primary)` | Halo color. |
| duration | `string` | `1.5s` | Duration of one pulse cycle. |
| ...buttonProps | `ComponentPropsWithoutRef<"button">` | — | Native button props. |

## Events

| Event | Type | Description |
|------|------|------|
| onClick | `(e: MouseEvent<HTMLButtonElement>) => void` | Click callback, transparently transmitted via `ComponentPropsWithoutRef<"button">` |

## Slots

| Slot | Type | Description |
|------|------|------|
| children | `ReactNode` | Button copy, transparently transmitted through the native button attribute |

## Example
```tsx
<PulsatingButton>Subscribe now</PulsatingButton>

// Slower pulse
<PulsatingButton duration="2.5s">Subscribe now</PulsatingButton>
```

## Usage guidelines

- Tailwind Preflight applies `svg { display: block }`, which can split a custom icon and label. See [[tailwind-preflight-svg-block-breaks-icon-text-in-nonflex-button]] and make the content wrapper `inline-flex`.

## Related
[Button](../button/button.md) · [ShimmerButton](../shimmer-button/shimmer-button.md) · [RainbowButton](../rainbow-button/rainbow-button.md) · [RippleButton](../ripple-button/ripple-button.md) · [ButtonGroup](../button-group/button-group.md) · [SocialButton](../social-button/social-button.md)
