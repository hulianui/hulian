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
| size | `"sm" \| "md" \| "lg"` | `"md"` | Size step, on the same 32/40/48px scale as Button. |
| shimmerColor | `string` | follows `foreground` | Shimmer highlight color; defaults to `--hulian-shimmer-fg` (i.e. `foreground`). |
| shimmerSize | `string` | `0.05em` | Shimmer width. |
| borderRadius | `string` | `var(--radius)` | Button border radius. |
| shimmerDuration | `string` | `3s` | Duration of one shimmer cycle. |
| background | `string` | `var(--color-primary)` | Button background color. |
| foreground | `string` | `var(--color-primary-foreground)` | Text color (#288), paired with `background`: by default both follow the theme; when you pass a **fixed** background (a brand gradient that ignores the theme) pair it with a fixed foreground, or dark mode renders near-black text on the gradient. Lands in `--hulian-shimmer-fg`; the shimmer color reads it by default. |
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
<ShimmerButton background="var(--color-danger)" foreground="var(--color-danger-foreground)">Delete</ShimmerButton>
// Fixed brand gradient (ignores the theme): fix the foreground too, or dark mode turns primary-foreground near-black on the purple gradient
<ShimmerButton background="linear-gradient(135deg,#7c3aed,#4f46e5)" foreground="#fff">Get started</ShimmerButton>
```

## Usage guidelines

- **Shares its base with [Button](../button/button.md).** Layout, the three `size` steps (32/40/48px tall), the focus ring, the disabled treatment, and `forwardRef` all come from the same `EFFECT_BUTTON_BASE_CLASS` and `BUTTON_SIZE_CLASS`. **Colour and corner radius are deliberately not shared**, since the background is this component's own effect layer. As a result it lines up with regular Buttons and matches the library-wide focus style; before 0.27.0 each effect button rolled its own markup, lacked all of the above, and sized itself with `px-6 py-3`, so a toolbar row came out uneven (#126).

- Pass theme-token CSS variables such as `var(--color-danger)` to color props so they adapt with the theme; avoid hard-coded color values.
- Tailwind Preflight applies `svg { display: block }`, which can split a custom icon and label. See [[tailwind-preflight-svg-block-breaks-icon-text-in-nonflex-button]] and make the content wrapper `inline-flex`.

## Related
[Button](../button/button.md) · [RainbowButton](../rainbow-button/rainbow-button.md) · [PulsatingButton](../pulsating-button/pulsating-button.md) · [RippleButton](../ripple-button/ripple-button.md) · [ButtonGroup](../button-group/button-group.md) · [SocialButton](../social-button/social-button.md)
