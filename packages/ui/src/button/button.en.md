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
| variant | `"solid" \| "outline" \| "ghost" \| "link"` | `"solid"` | Visual style. |
| tone | `"brand" \| "success" \| "warning" \| "danger" \| "neutral"` | `"brand"` | Semantic color tone (see the table below). |
| size | `"sm" \| "md" \| "lg" \| "icon" \| "iconSm" \| "iconLg" \| "iconXs"` | `"md"` | Control size; the three `icon*` sizes are square icon buttons whose side length matches the text size of the same name (see the table below). `iconXs` is a 20px micro size that matches **no** text size and is meant for dense table rows. |
| block | `boolean` | `false` | Stretches the button to the full container width, for mobile primary actions and form footers. |
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

## Semantic tones

Buttons are a two-dimensional model of **`variant` (shape) × `tone` (meaning)**, not a flat one-dimensional `type` list: "a solid success button" and "an outlined success button" are orthogonal choices and do not need one enum value each.

| tone | Use it for | Solid appearance |
|------|-----------|------------------|
| `brand` (default) | The primary action of the page: submit, save, next | Brand fill with white text |
| `success` | Positive confirmations: approve, publish, enable | Success fill with its own foreground |
| `warning` | Costly but non-destructive: reject, unpublish, force sync | Warning fill with its own foreground |
| `danger` | Irreversible destruction: delete, deactivate, clear | Danger fill with its own foreground |
| `neutral` | A secondary action of equal weight: cancel and go back, skip | Inverted fill (the foreground colour becomes the background) |

```tsx
<Button tone="success">Approve</Button>
<Button tone="warning" variant="outline">Reject</Button>
<Button tone="danger">Delete</Button>
<Button tone="neutral">Skip</Button>
```

Coming from a one-dimensional `type` model: `type="primary"` becomes a plain `<Button>`, `type="success"` becomes `tone="success"`, and `type="default"` or `plain` becomes `variant="outline"`. Hairline borders are already the library default, so there is nothing to opt into.

## Size scale

Three steps. Every icon size has the same side length as the text size of the same name, so **pair icon buttons with the matching text size** — otherwise an attached group ([ButtonGroup](../button-group/button-group.md)) shows a visible step at the seam.

| Text size | Height | Matching icon size | Side |
|-----------|--------|--------------------|------|
| `sm` | 32px | `iconSm` | 32px |
| `md` (default) | 40px | `icon` | 40px |
| `lg` | 48px | `iconLg` | 48px |

`iconXs` (20px) is **not** part of that scale: it has no matching text size and sits 12px shorter
than `sm`. It exists for micro actions inside dense table rows — tree expanders and inline row
actions — where the smallest `iconSm` (32px) would push `density="compact"` rows taller. The
built-in Table expander uses this size.

```tsx
{/* Expander inside a table row */}
<Button variant="ghost" tone="neutral" size="iconXs" aria-label="Expand">
  <ChevronRight className="size-4" />
</Button>
```

```tsx
{/* Correct: matching pair, equal height */}
<ButtonGroup><Button>Save</Button><Button size="icon"><ChevronDown className="size-4" /></Button></ButtonGroup>
{/* Wrong: mismatched sizes, 8px apart */}
<ButtonGroup><Button>Save</Button><Button size="iconSm"><ChevronDown className="size-4" /></Button></ButtonGroup>
```

## Examples
```tsx
<Button>Default</Button>
<Button variant="outline">Outline</Button>
<Button tone="danger">Danger</Button>
<Button tone="success" variant="outline">Approve</Button>
<Button block>Full-width primary action</Button>
<Button loading>Loading</Button>
```

## Usage guidelines

- To avoid unsafe element animation, `render` mode **does not apply Motion**, so it has no press-scale effect. Color and hover transitions remain, and Button's `children` take precedence as the visible content.
- `loading` disables the button automatically; do not add `disabled` solely for the loading state.
- Button text **cannot be selected** (the base class carries `select-none`). A button label is a control affordance, not content, and rapid clicking would otherwise make the browser select the word or the whole line. Do not turn text people need to copy into a button.
- `tone` changes meaning, never shape. For a light-background success button use `tone="success" variant="outline"` instead of overriding the background through `className`.
- `tone="neutral"` in `solid` is an **inverted** fill (dark background in light mode, light background in dark mode), not a grey one. A grey fill is nearly indistinguishable from `variant="outline"`, which would make the tone pointless.
- If an icon wraps away from its label in a custom or effect button, Tailwind Preflight's `svg{display:block}` rule is usually the cause. See [[tailwind-preflight-svg-block-breaks-icon-text-in-nonflex-button]]; the wrapper needs `inline-flex`. Button already handles this internally.

## Related
[ShimmerButton](../shimmer-button/shimmer-button.md) · [RainbowButton](../rainbow-button/rainbow-button.md) · [PulsatingButton](../pulsating-button/pulsating-button.md) · [RippleButton](../ripple-button/ripple-button.md) · [ButtonGroup](../button-group/button-group.md) · [SocialButton](../social-button/social-button.md)
