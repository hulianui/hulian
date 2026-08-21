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

> Social sign-in button · built-in WeChat, Alipay, QQ, Weibo, GitHub, Google, Apple, X, Discord, and GitLab logos + a custom-brand escape hatch + outline/solid variants + icon-only shape + loading state · theme-aware monochrome brands · forms/button

## When to use

Use SocialButton for third-party account sign-in or linking. Brand logos, default labels, and colors are built in, so consumers do not need to wire simple-icons directly. For providers outside the built-in list (self-hosted OIDC, Keycloak, Authentik, Okta, enterprise SSO, or any brand that is not bundled), pass an object to `provider`; see "Custom providers" below. Use [Button](../button/button.md) for ordinary actions, and [ButtonGroup](../button-group/button-group.md) when several sign-in providers should be presented together.

## Import
```ts
import { SocialButton } from "@hulianui/ui"
```

## Props

Inherit native `<button>` properties (except `children` controlled override).

| Name | Type | Default | Description |
|------|------|------|------|
| provider* | `"wechat" \| "alipay" \| "qq" \| "weibo" \| "github" \| "google" \| "apple" \| "x" \| "discord" \| "gitlab" \| SocialBrand` | - | Determines the logo, default label, and brand color. Pass a `SocialBrand` object to use a provider outside the built-in list; its fields are listed below. |
| variant | `"solid" \| "outline"` | `"outline"` | `solid` uses a brand fill; monochrome brands use theme foreground. `outline` uses a neutral border and brand-color logo. |
| shape | `"button" \| "icon"` | `"button"` | `button` includes a label; `icon` renders a square logo-only button. |
| size | `"sm" \| "md" \| "lg"` | `"md"` | size |
| loading | `boolean` | `false` | Submitting: Replace the logo with a spinning circle and disable it |
| className | `string` | - | Transparently transmit the root node class name |

### SocialBrand (custom providers)

Fields accepted when `provider` is an object. Sizing, shape, loading, press feedback, and focus ring are shared with the built-in brands.

| Name | Type | Default | Description |
|------|------|------|------|
| icon* | `ReactNode` | - | Brand logo. An inline `<svg>`, an `<img>`, or an icon component; it is constrained to the icon size of the current `size`. |
| label* | `string` | - | Brand name. Used for the default label and for the `aria-label` when `shape="icon"`. |
| brandColor | `string` | - | Brand color. Tints the logo in outline mode and fills the button in solid mode. Omitting it selects the monochrome treatment used by the built-in GitHub, X, and Apple buttons. |

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
```tsx
{/* Custom provider. Keep the object at module scope: the component is memoized. */}
const KEYCLOAK: SocialBrand = { label: "Enterprise SSO", icon: <LockIcon /> };

<SocialButton provider={KEYCLOAK} />
```

## Usage guidelines

- **Keep a custom brand object at module scope** (or wrap it in `useMemo`). The component is memoized, so an inline `provider={{ ... }}` object literal creates a new reference on every render and defeats that memoization.
- **Do not wait for the enum to grow.** simple-icons removed the Microsoft, LinkedIn, Slack, and Feishu logos on legal request, so those cannot be bundled at all, and self-hosted identity providers are impossible to enumerate. Reach for `SocialBrand` instead of dropping the whole group back to `Button` with hand-placed SVGs because two providers out of four are missing.
- `loading` disables the button automatically, so an additional `disabled` prop is unnecessary.
- In solid mode, monochrome GitHub, X, and Apple buttons follow the theme foreground to remain visible in dark themes; do not override them with hard-coded black. A custom brand without `brandColor` uses the same treatment.

## Related
[Button](../button/button.md) · [ShimmerButton](../shimmer-button/shimmer-button.md) · [RainbowButton](../rainbow-button/rainbow-button.md) · [PulsatingButton](../pulsating-button/pulsating-button.md) · [RippleButton](../ripple-button/ripple-button.md) · [ButtonGroup](../button-group/button-group.md)
