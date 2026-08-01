---
slug: button
name: Button
category: forms
group: button
tags: []
exports: [Button, buttonVariants]
status: enriched
---

# Button

> Button · CVA variant + press animation · forms/button

## When to use

Use Button for standard actions with solid, outline, ghost, or link styling; brand or danger tones; an optional loading state; and a press-scale animation. Use [ShimmerButton](../shimmer-button/shimmer-button.md), [RainbowButton](../rainbow-button/rainbow-button.md), or [PulsatingButton](../pulsating-button/pulsating-button.md) for a special-effect CTA, and [ButtonGroup](../button-group/button-group.md) for related actions. When you need the styling without `<button>` semantics, call `buttonVariants(...)` to obtain the class name.

## Import
```ts
import { Button, buttonVariants } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| variant | `"solid" ｜ "outline" ｜ "ghost" ｜ "link"` | `"solid"` | Visual style. |
| tone | `"brand" ｜ "danger"` | `"brand"` | Semantic color tone. |
| size | `"sm" ｜ "md" ｜ "lg" ｜ "icon" ｜ "iconSm"` | `"md"` | Control size; `icon` and `iconSm` create square icon buttons. |
| loading | `boolean` | `false` | Shows a spinner and disables the button. |
| ...ButtonHTMLAttributes | `ButtonHTMLAttributes<HTMLButtonElement>` | — | Native attributes such as `disabled` and `type`. |

## Events

| Event | Type | Description |
|------|------|------|
| onClick | `(e: MouseEvent<HTMLButtonElement>) => void` | Native click callback inherited from `ButtonHTMLAttributes`. |

## Slots

| Slot | Type | Description |
|------|------|------|
| children | `ReactNode` | Button content. |
| render | `ReactElement` | Custom element such as `<a>` or Next.js `<Link>`. Button styles and `aria-disabled` are merged into this element. |

## Examples
```tsx
<Button>Default</Button>
<Button variant="outline">Outline</Button>
<Button tone="danger">Danger</Button>
<Button loading>Loading</Button>
```

## Usage guidelines

- To avoid unsafe element animation, `render` mode **does not apply Motion**, so it has no press-scale effect. Color and hover transitions remain, and Button's `children` take precedence as the visible content.
- `loading` disables the button automatically; do not add `disabled` solely for the loading state.
- If an icon wraps away from its label in a custom or effect button, Tailwind Preflight's `svg{display:block}` rule is usually the cause. See [[tailwind-preflight-svg-block-breaks-icon-text-in-nonflex-button]]; the wrapper needs `inline-flex`. Button already handles this internally.

## Related
[ShimmerButton](../shimmer-button/shimmer-button.md) · [RainbowButton](../rainbow-button/rainbow-button.md) · [PulsatingButton](../pulsating-button/pulsating-button.md) · [RippleButton](../ripple-button/ripple-button.md) · [ButtonGroup](../button-group/button-group.md) · [SocialButton](../social-button/social-button.md)
