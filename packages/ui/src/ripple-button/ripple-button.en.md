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
| variant | `"solid" \| "outline" \| "ghost" \| "soft"` | `"solid"` | Appearance step, colored exactly like the [Button](../button/button.md) step of the same name. There is **no `link`**: the ripple needs a box, see the usage notes. |
| tone | `"brand" \| "neutral" \| "success" \| "warning" \| "danger"` | `"brand"` | Semantic tone, colored exactly like the Button step of the same name. There is **no `current`**: the default ripple color is derived from the tone, and an inherited color derives nothing. |
| rippleColor | `string` | Derived from `variant` × `tone` | Ripple color. Solid steps default to the foreground color of the tone (a light ripple on a dark surface); every other step defaults to the tone itself. Passing a value overrides the derivation. |
| duration | `string` | `"600ms"` | Duration of one ripple animation. |

## Events

| Event | Type | Description |
|------|------|------|
| onClick | `(e: MouseEvent<HTMLButtonElement>) => void` | Transparently transmit native click callback (click triggers ripple diffusion at the same time) |

## Slots

| Slot | Type | Description |
|------|------|------|
| children | `ReactNode` | Button content (copy/icon) |
| render | `ReactElement` | Custom rendered element, such as `<a>` or Next.js `<Link>`; button styles and the ripple layer are merged into it. |

## Example
```tsx
<RippleButton>Show ripple</RippleButton>
```
```tsx
<RippleButton duration="900ms">Show slow ripple</RippleButton>
```
```tsx
{/* Appearance is picked with variant x tone, exactly like Button - no buttonVariants() injection */}
<RippleButton variant="outline">Cancel</RippleButton>
<RippleButton variant="ghost">Later</RippleButton>
<RippleButton tone="danger">Delete</RippleButton>
<RippleButton variant="outline" tone="danger">Delete</RippleButton>
```
```tsx
{/* Looks like a solid button but has to be a real link: middle-click, copy link address, crawlable */}
<RippleButton render={<Link href="/docs" />}>Read the docs</RippleButton>
```

## Usage guidelines

- **Shares its base and its color steps with [Button](../button/button.md).** Layout, the three `size` steps (32/40/48px tall), the focus ring, the disabled treatment, and `forwardRef` all come from the same `EFFECT_BUTTON_BASE_CLASS` and `BUTTON_SIZE_CLASS`, and every `variant` x `tone` cell carries the same color as the Button cell of the same name (#233). **Corner radius, shadow and color hover are deliberately not shared**: the radius belongs to the effect layer, none of the four effect buttons carry `shadow-sm`, and color hover conflicts with this base (next note). Before 0.27.0 each effect button rolled its own markup, lacked all of the above, and sized itself with `px-6 py-3`, so a toolbar row came out uneven (#126).
- **There is no color hover; the ripple is the feedback.** The effect base deliberately omits `transition-colors` (these components animate a background, not a color), so a `hover:bg-*` would land as an untransitioned jump. A `variant="ghost"` ripple button therefore rests as plain text and does not tint under the pointer. When a secondary action has to react on hover, use `Button variant="ghost"`; this component answers on press.
- **`variant` has no `link` and `tone` has no `current`.** The ripple needs a box: `link` removes the height and the horizontal padding, so the ripple on an `h-auto px-0` label is clipped to a sliver or smears across the text. And the default ripple color is derived from the tone, which is exactly what `current` refuses to provide. Pass `rippleColor="currentColor"` explicitly if the ripple should follow the container.
- **`variant` is about appearance, `render` is about semantics.** The note above ("use `Button variant="link"`") is about how the control *looks*, that is, whether it has a button box. If you need something that looks exactly like this solid button but has to be an `<a>` (middle-click to open in a new tab, copy link address, visible to crawlers), that is `render={<a href="…" />}`; the ripple and the colors are unchanged (#256).
- The derived ripple color depends on the step: solid steps use the **foreground** color of the tone (a light ripple on a dark surface), while outline, ghost and soft use the **tone itself**. The reverse (a foreground color on a light surface) is an almost invisible ring, so keep the surface in mind when overriding `rippleColor`.
- The ripple animation is automatically suppressed under `prefers-reduced-motion: reduce`; consumers do not need to add a separate motion check.

## Related
[Button](../button/button.md) · [ShimmerButton](../shimmer-button/shimmer-button.md) · [RainbowButton](../rainbow-button/rainbow-button.md) · [PulsatingButton](../pulsating-button/pulsating-button.md) · [ButtonGroup](../button-group/button-group.md) · [SocialButton](../social-button/social-button.md)
