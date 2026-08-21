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
| size | `"sm" \| "md" \| "lg"` | `"md"` | Size step, on the same 32/40/48px scale as Button. |
| speed | `string` | `3s` | Duration of one rainbow animation cycle. |
| ...buttonProps | `ComponentPropsWithoutRef<"button">` | - | Native button props. |

## Events

| Event | Type | Description |
|------|------|------|
| onClick | `(e: MouseEvent<HTMLButtonElement>) => void` | Click callback, transparently transmitted via `ComponentPropsWithoutRef<"button">` |

## Slots

| Slot | Type | Description |
|------|------|------|
| children | `ReactNode` | Button copy, transparently transmitted through the native button attribute |
| render | `ReactElement` | Custom rendered element, such as `<a>` or Next.js `<Link>`; button styles and the bottom glow layer are merged into it. |

## Example
```tsx
<RainbowButton>Get Started</RainbowButton>

// Slower animation
<RainbowButton speed="5s">Get Started</RainbowButton>

// A landing-page CTA is often a link: render swaps the tag, the rainbow and glow stay
<RainbowButton render={<Link href="/pricing" />}>See pricing</RainbowButton>
```

## Usage guidelines

- **Shares its base with [Button](../button/button.md).** Layout, the three `size` steps (32/40/48px tall), the focus ring, the disabled treatment, and `forwardRef` all come from the same `EFFECT_BUTTON_BASE_CLASS` and `BUTTON_SIZE_CLASS`. **Colour and corner radius are deliberately not shared**, since the background is this component's own effect layer. As a result it lines up with regular Buttons and matches the library-wide focus style; before 0.27.0 each effect button rolled its own markup, lacked all of the above, and sized itself with `px-6 py-3`, so a toolbar row came out uneven (#126).

- Tailwind Preflight applies `svg { display: block }`, which can split a custom icon and label. See [[tailwind-preflight-svg-block-breaks-icon-text-in-nonflex-button]] and make the content wrapper `inline-flex`.

## Related
[Button](../button/button.md) · [ShimmerButton](../shimmer-button/shimmer-button.md) · [PulsatingButton](../pulsating-button/pulsating-button.md) · [RippleButton](../ripple-button/ripple-button.md) · [ButtonGroup](../button-group/button-group.md) · [SocialButton](../social-button/social-button.md)
