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

> Rainbow button · animated chart-color background + blurred halo · RSC-safe · forms/button · #animated

## When to use

Use RainbowButton for a highly prominent hero CTA with flowing chart colors and a blurred halo. Use [Button](../button/button.md) for ordinary actions, [ShimmerButton](../shimmer-button/shimmer-button.md) for one animated edge highlight, or [PulsatingButton](../pulsating-button/pulsating-button.md) for an expanding pulse.

## Import
```ts
import { RainbowButton } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| speed | `string` | `3s` | Duration of one rainbow animation cycle. |
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
<RainbowButton>Get Started</RainbowButton>

// Slower animation
<RainbowButton speed="5s">Get Started</RainbowButton>
```

## Usage guidelines

- Tailwind Preflight applies `svg { display: block }`, which can split a custom icon and label. See [[tailwind-preflight-svg-block-breaks-icon-text-in-nonflex-button]] and make the content wrapper `inline-flex`.

## Related
[Button](../button/button.md) · [ShimmerButton](../shimmer-button/shimmer-button.md) · [PulsatingButton](../pulsating-button/pulsating-button.md) · [RippleButton](../ripple-button/ripple-button.md) · [ButtonGroup](../button-group/button-group.md) · [SocialButton](../social-button/social-button.md)
