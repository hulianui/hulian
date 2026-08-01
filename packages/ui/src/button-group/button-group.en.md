---
slug: button-group
name: ButtonGroup
category: forms
group: button
tags: []
exports: [ButtonGroup]
status: enriched
---

# ButtonGroup

> Button group · Attached or spaced horizontal/vertical controls for segmented toolbars, split buttons, and steppers · forms/button

## When to use

Use ButtonGroup for related [Buttons](../button/button.md), such as toolbar segments, a split button with a primary action and menu, or a decrement/value/increment stepper. The default `attached` mode joins adjacent controls; pass `attached={false}` to preserve spacing while keeping the semantic group. ButtonGroup only provides layout and does not override each child's `variant` or `size`. Use Button directly for a standalone action.

## Import
```ts
import { ButtonGroup } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| orientation | `"horizontal" ｜ "vertical"` | `"horizontal"` | Layout direction. |
| attached | `boolean` | `true` | Joins child controls by removing inner radii and merging adjacent borders. Pass `false` to keep the configured gap. |
| gap | `"sm" ｜ "md"` | `"sm"` | Gap between children when `attached={false}`. |
| className | `string` | — | Additional class name for the root element. |
| aria-label | `string` | — | Accessible label for the group. |

## Slots

| Slot | Type | Description |
|------|------|------|
| children | `ReactNode` | Usually `<Button>` elements; trigger buttons wrapped by Dropdown or Tooltip are also supported. |

## Examples
```tsx
<ButtonGroup aria-label="Alignment">
  <Button variant="outline" size="icon" aria-label="Align left"><AlignLeft className="size-4" /></Button>
  <Button variant="outline" size="icon" aria-label="Align center"><AlignCenter className="size-4" /></Button>
  <Button variant="outline" size="icon" aria-label="Align right"><AlignRight className="size-4" /></Button>
</ButtonGroup>
```
```tsx
{/* Split button: primary action + more options */}
<ButtonGroup aria-label="Save">
  <Button>Save</Button>
  <Button size="icon" aria-label="More save options"><ChevronDown className="size-4" /></Button>
</ButtonGroup>
```

## Usage guidelines

`gap` only applies when `attached={false}`. In attached mode, the component joins corners and borders without adding margins between child controls.

## Related
[Button](../button/button.md) · [ShimmerButton](../shimmer-button/shimmer-button.md) · [RainbowButton](../rainbow-button/rainbow-button.md) · [PulsatingButton](../pulsating-button/pulsating-button.md) · [RippleButton](../ripple-button/ripple-button.md) · [SocialButton](../social-button/social-button.md)
