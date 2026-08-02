---
slug: social-button
name: SocialButton
category: forms
group: button
tags: []
exports: [SocialButton]
status: enriched
---

# SocialButton

> Social sign-in button · built-in WeChat, Alipay, QQ, Weibo, GitHub, Google, Apple, and X logos + outline/solid variants + icon-only shape + loading state · theme-aware monochrome brands · forms/button

## When to use

Use SocialButton for third-party account sign-in or linking. Brand logos, default labels, and colors are built in, so consumers do not need to wire simple-icons directly. Use [Button](../button/button.md) for ordinary actions, and [ButtonGroup](../button-group/button-group.md) when several sign-in providers should be presented together.

## Import
```ts
import { SocialButton } from "@hulianui/ui"
```

## Props

Inherit native `<button>` properties (except `children` controlled override).

| Name | Type | Default | Description |
|------|------|------|------|
| provider* | `"wechat" \| "alipay" \| "qq" \| "weibo" \| "github" \| "google" \| "apple" \| "x"` | — | Determines the logo, default label, and brand color. |
| variant | `"solid" \| "outline"` | `"outline"` | `solid` uses a brand fill; monochrome brands use theme foreground. `outline` uses a neutral border and brand-color logo. |
| shape | `"button" \| "icon"` | `"button"` | `button` includes a label; `icon` renders a square logo-only button. |
| size | `"sm" \| "md" \| "lg"` | `"md"` | size |
| loading | `boolean` | `false` | Submitting: Replace the logo with a spinning circle and disable it |
| className | `string` | — | Transparently transmit the root node class name |

## Events

| Event | Type | Description |
|------|------|------|
| onClick | `(e: MouseEvent<HTMLButtonElement>) => void` | Transparently transmit native click callback (initiate third-party login/binding) |

## Slots

| Slot | Type | Description |
|------|------|------|
| children | `ReactNode` | Override the default copy (such as "Log in using WeChat" → "WeChat") |

## Example
```tsx
<SocialButton provider="wechat" />
<SocialButton provider="github" variant="solid" />
```
```tsx
{/* Icon-only button and loading state */}
<SocialButton provider="alipay" shape="icon" />
<SocialButton provider="github" loading />
```

## Usage guidelines

`loading` disables the button automatically, so an additional `disabled` prop is unnecessary. In solid mode, monochrome GitHub, X, and Apple buttons follow the theme foreground to remain visible in dark themes; do not override them with hard-coded black.

## Related
[Button](../button/button.md) · [ShimmerButton](../shimmer-button/shimmer-button.md) · [RainbowButton](../rainbow-button/rainbow-button.md) · [PulsatingButton](../pulsating-button/pulsating-button.md) · [RippleButton](../ripple-button/ripple-button.md) · [ButtonGroup](../button-group/button-group.md)
