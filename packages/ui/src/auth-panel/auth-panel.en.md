---
slug: auth-panel
name: AuthPanel
category: forms
group: framework
tags: []
exports: [AuthPanel]
status: enriched
---

# AuthPanel

> Builds the branded half of a split authentication page with token-based gradients, highlights, content, and a footer. · forms/framework

## When to use

Use AuthPanel for the promotional half of the standard split authentication layout: a gradient brand panel on the left and a sign-in, registration, or password-recovery form on the right.

The component exists to provide a supported expression for this background, not merely to save a few flex classes ([hulianui/hulian#71](https://github.com/hulianui/hulian/issues/71)):

- Tailwind utilities cannot express a recipe such as `radial-gradient(125% 125% at 0% 0%, color-mix(in oklab, var(--color-primary) 12%, var(--color-bg)), ...)` cleanly.
- The guard treats `style` overrides on library components as errors.

Without a component-level recipe, consumers are forced back to a bare `<div>` with an inline background. AuthPanel keeps the most prominent surface in the component system: change the brand through `color`, and all recipes follow dark mode automatically because they mix against `--color-bg`.

## Import
```ts
import { AuthPanel } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| brand | `ReactNode` | - | Brand slot, normally a [Brand](../brand/brand.md). |
| title | `ReactNode` | - | Main headline. |
| titleLevel | `1..6` | `2` | Semantic heading level. It changes only the `h1`-`h6` element, not its visual size. |
| description | `ReactNode` | - | Supporting copy below the headline. |
| highlights | `ReactNode[]` | - | Benefit list. Each item receives a check mark that follows `color`. |
| children | `ReactNode` | - | Free-form middle content such as artwork, metrics, or a customer-logo wall. |
| footer | `ReactNode` | - | Footer content such as copyright, registration details, or secondary links. |
| color | `string` | `"primary"` | Brand color. Accepts a semantic tone, arbitrary CSS color, or variable through `resolveTone`, like [Brand](../brand/brand.md) `.color`, [Dot](../dot/dot.md) `.color`, and `ChartSeries.color`. |
| gradient | `"radial" \| "linear" \| "mesh" \| "none"` | `"radial"` | Background recipe described below. |
| contentAlign | `"start" \| "center"` | `"start"` | Vertical placement of the middle content (title, description, children). `start` keeps it right below the brand slot; `center` centers it relative to the whole panel so it lines up with a `place-items-center` form on the other side. In both modes the brand stays at the top and highlights / footer stay at the bottom. |
| className | `string` | - | Class name for the root element. |

### Background recipes

| Value | Appearance | Best suited to |
|------|------|------|
| `radial` (default) | Soft glow originating from the upper-left corner. | General use and admin sign-in pages. |
| `linear` | Directional 135-degree gradient with a small amount of brand color at both ends. | Layouts that benefit from a stronger direction. |
| `mesh` | Three layered pools of light. | More expressive registration and landing pages. |
| `none` | Solid `surface` background with no inline `background` value. | Composing [DotPattern](../dot-pattern/dot-pattern.md), [GridPattern](../grid-pattern/grid-pattern.md), or another pattern yourself. |

## Example
```tsx
// Split sign-in page: remove the form card surface to avoid nesting one card inside another.
<div className="grid min-h-dvh xl:grid-cols-2">
  <AuthPanel
    brand={<Brand name="Cloud Edge" description="Global edge computing" />}
    title="Take your ideas to the global edge"
    description="Create an account and launch your first project in five minutes. No credit card required."
    highlights={["Start free and scale to zero when idle", "Go from git push to the global edge"]}
    footer="© 2026 Cloud Edge"
    className="hidden xl:flex"
  />
  <div className="grid place-items-center p-8">
    <LoginForm
      surface={false}
      fields={{
        username: { label: "Administrator account", placeholder: "Enter your account", prefix: <UserRound /> },
        password: { placeholder: "Enter your password", prefix: <KeyRound /> },
      }}
    />
  </div>
</div>
```

```tsx
// Registration page: mesh recipe with custom middle content.
<AuthPanel gradient="mesh" color="chart-2" title="Get started">
  <img src="/illustration.svg" alt="" className="max-w-xs" />
</AuthPanel>
```

## Usage guidelines

- **AuthPanel does not set its own height.** It uses `h-full`, so the outer grid owns the height. A split page typically uses `grid min-h-dvh xl:grid-cols-2`. Hard-coding `h-dvh` inside the component would break embedded card layouts, as described in the [AdminLayout `fitViewport` guidance](../admin-layout/admin-layout.md).
- **Hide the decorative panel on narrow screens with `className="hidden xl:flex"` instead of rendering different server and client trees.** The form can stand alone on small screens.
- Every gradient recipe mixes with `--color-bg`, so dark mode requires no separate override. Wrapping the component in a consumer `dark:` background override disables that behavior.
- `gradient="none"` is for layering your own pattern, not for making the panel transparent. It retains `bg-surface` so the panel remains visually distinct from the form area.
- Pass `surface={false}` to the adjacent [LoginForm](../login-form/login-form.md). The promotional panel already carries the visual weight, and another card surface creates a card-within-a-card layout.
- A consumer `style` can still replace the background as an escape hatch, but that bypasses the component system. Consider whether a reusable `gradient` recipe should be added instead.
- **When the headline does not line up with the vertically centered form on the other side** (tall viewport: headline pinned to the top, form in the middle, a large gap between them), use `contentAlign="center"`. Do not stretch the internal layout with selectors such as `[&>div:first-child]:flex-1`. The internal DOM is not a contract and changes to it will break that workaround.

## Related
[LoginForm](../login-form/login-form.md) · [Brand](../brand/brand.md) · [Field](../field/field.md) · [SocialButton](../social-button/social-button.md) · [ClickCaptcha](../click-captcha/click-captcha.md) · [DotPattern](../dot-pattern/dot-pattern.md)
