---
slug: shimmer-button
name: ShimmerButton
category: forms
group: button
tags: [animated]
exports: [ShimmerButton]
status: enriched
---

# ShimmerButton

> Shimmer button · animated conic-gradient edge + theme tokens · RSC-safe · forms/button · #animated

## When to use

Use ShimmerButton for a primary CTA that needs a moving highlight around its edge. Use [Button](../button/button.md) for ordinary actions, [RainbowButton](../rainbow-button/rainbow-button.md) for a flowing multicolor background, or [PulsatingButton](../pulsating-button/pulsating-button.md) for an expanding halo.

## Import
```ts
import { ShimmerButton } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| shimmerColor | `string` | `var(--color-primary-foreground)` | Shimmer highlight color. |
| shimmerSize | `string` | `0.05em` | Shimmer width. |
| borderRadius | `string` | `var(--radius)` | Button border radius. |
| shimmerDuration | `string` | `3s` | Duration of one shimmer cycle. |
| background | `string` | `var(--color-primary)` | Button background color. |
| ...buttonProps | `ComponentPropsWithoutRef<"button">` | — | Native button attributes passed to the rendered element. |

## Events

| Event | Type | Description |
|------|------|------|
| onClick | `(e: MouseEvent<HTMLButtonElement>) => void` | Native click handler. |

## Slots

| Slot | Type | Description |
|------|------|------|
| children | `ReactNode` | Button content. |
| render | `ReactElement` | Custom rendered element, such as `<a>` or Next.js `<Link>`; button styles and shimmer structure are merged into it. |

## Example
```tsx
<ShimmerButton>Get started with Hulian</ShimmerButton>

// Change the background color
<ShimmerButton background="var(--color-danger)">Delete</ShimmerButton>
```

## Usage guidelines

- Pass theme-token CSS variables such as `var(--color-danger)` to color props so they adapt with the theme; avoid hard-coded color values.
- Tailwind Preflight applies `svg { display: block }`, which can split a custom icon and label. See [[tailwind-preflight-svg-block-breaks-icon-text-in-nonflex-button]] and make the content wrapper `inline-flex`.

## Related
[Button](../button/button.md) · [RainbowButton](../rainbow-button/rainbow-button.md) · [PulsatingButton](../pulsating-button/pulsating-button.md) · [RippleButton](../ripple-button/ripple-button.md) · [ButtonGroup](../button-group/button-group.md) · [SocialButton](../social-button/social-button.md)
