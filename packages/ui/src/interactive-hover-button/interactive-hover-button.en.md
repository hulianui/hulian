---
slug: interactive-hover-button
name: InteractiveHoverButton
category: forms
group: button
tags: [animated]
exports: [InteractiveHoverButton]
status: enriched
---

# InteractiveHoverButton

> Interactive hover button · A dot expands into a full background with a trailing arrow · forms/button · #animated

## When to use

Use it as the **primary call to action** on a landing page or marketing hero. At rest it is a light pill of "dot plus label"; on hover or focus the dot expands into a full background and the label is replaced by "label plus arrow", which makes it obvious which control is *the* one to press.

Use only one per page. The effect works through contrast with the restrained elements around it. For secondary actions use [Button](../button/button.md) with `variant="outline"` or `"ghost"`. For a travelling edge spark use [ShimmerButton](../shimmer-button/shimmer-button.md), for a breathing pulse use [PulsatingButton](../pulsating-button/pulsating-button.md), and for a click ripple use [RippleButton](../ripple-button/ripple-button.md). Admin consoles should **not** use this family.

## Import
```ts
import { InteractiveHoverButton } from "@hulianui/ui"
```

## Props

Inherits the native `<button>` attributes such as `onClick`, `disabled`, and `type`.

| Name | Type | Default | Description |
|------|------|------|------|
| size | `"sm" \| "md" \| "lg"` | `"md"` | Size preset matching [Button](../button/button.md) one to one (32 / 40 / 48px tall), so it lines up with ordinary buttons. |
| background | `string` | `var(--color-primary)` | Background color after expansion. |
| foreground | `string` | `var(--color-primary-foreground)` | Text color after expansion. |
| dotColor | `string` | Follows `background` | Color of the resting-state dot. |
| duration | `string` | `"0.4s"` | Expansion duration. |
| icon | `ReactNode` | Right chevron | Trailing icon in the hover layer; pass `null` to remove it. |
| render | `ReactElement` | - | Renders a custom element such as `<a>` or a Next `<Link>` instead of `<button>`, for landing pages whose primary CTA is a link. Styles and the two internal layers merge into that element; the label still comes from `children`. |

## Slots

| Slot | Type | Description |
|------|------|------|
| children | `ReactNode` | Button label. Both the resting and hover layers render a copy; the hover layer is entirely `aria-hidden`, so the accessible name appears only once. |

## Examples
```tsx
<InteractiveHoverButton>Get started</InteractiveHoverButton>
```
```tsx
{/* Custom colors; chart tokens follow the light and dark themes */}
<InteractiveHoverButton background="var(--color-chart-2)">Try it now</InteractiveHoverButton>
```
```tsx
{/* A landing-page CTA is often a link */}
<InteractiveHoverButton render={<a href="/docs" />}>Read the docs</InteractiveHoverButton>
```

## Usage guidelines

- **Do not use it as an ordinary button.** On a dense admin screen with dozens of actions the expansion becomes noise; its meaning is "the single most important action on this page".
- The expansion uses `clip-path: circle(150% …)` rather than scaling a dot. The upstream `scale(100.8)` is a magic number derived from one particular button width, so **a slightly wider button is no longer covered** (long labels, two-line CJK text, the `lg` size), the corners leak the resting background, and the failure is silent until someone looks at it in a browser. Percentages here resolve against the reference box's diagonal, so any width is covered.
- **Focus expands the same way hover does.** Keyboard users never see hover; without that rule, tabbing to the button leaves only a focus ring and nothing says "primary CTA". Do not drop the `group-focus-visible:` rule while restyling.
- The label inside the hover layer is a second copy and the whole layer is `aria-hidden`. Putting focusable elements (links, buttons) in there creates a pocket that screen readers cannot reach and the keyboard cannot tab into.
- When customizing `background`, check its contrast against `foreground`: the default pair is primary / primary-foreground, and changing only the background can fall below the threshold.

## Related
[Button](../button/button.md) · [ShimmerButton](../shimmer-button/shimmer-button.md) · [RainbowButton](../rainbow-button/rainbow-button.md) · [PulsatingButton](../pulsating-button/pulsating-button.md) · [RippleButton](../ripple-button/ripple-button.md)
