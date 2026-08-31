---
slug: brand
name: Brand
category: navigation
group: global
tags: []
exports: [Brand]
status: enriched
---

# Brand

> Brand identity · Square badge plus site name and optional description · Derives the badge from the first character of the name when mark is omitted · Mark accepts icons, images, animated images, and video (picture reduced-motion fallbacks and video already receive the fill rules) · Three sizes for navigation, sidebars, and authentication pages · Custom badge color · Mark-only collapsed state · Native href or framework-router render slot · navigation/global

## When to use

Use Brand for the common square badge and site-name lockup found in the upper-left of a navigation bar, at the top of a sidebar, in a footer brand column, or on an authentication page.

[Avatar](../avatar/avatar.md) is not a substitute: Avatar is circular and its sizes describe a circular diameter, while a brand badge needs squared corners and token-based rounding. Changing Avatar's shape through `className` would be a consumer-side patch ([hulianui/hulian#57](https://github.com/hulianui/hulian/issues/57)).

## Import
```ts
import { Brand } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| mark | `ReactNode` | First character of `name` | Badge content such as an icon, image, animated image, video, or initial. |
| name | `ReactNode` | - | Brand name. Omit it to render only the badge in a collapsed sidebar. |
| description | `ReactNode` | - | One-line subtitle below the brand name, such as a version or positioning statement. |
| size | `"sm" \| "md" \| "lg"` | `"md"` | `sm` is a 28px navigation badge, `md` is a 36px sidebar badge, and `lg` is for authentication-page branding. |
| color | `string` | `"primary"` | Badge background. Accepts a semantic tone such as `chart-3` or any CSS color. |
| href | `string` | - | Native link target, normally the home page. |
| render | `ReactElement` | - | Renders through a framework router element such as `<Link to="/" />`, following the Button, Link, and NavMenuItem render contract. |
| className | `string` | - | Class name for the root; remaining native attributes are forwarded. |

## Example
```tsx
// Navigation bar
<Brand size="sm" mark={<Logo />} name="Hulian Admin" render={<Link to="/" />} />

// Sidebar: retain only the badge when collapsed
<Brand mark={<Logo />} name={collapsed ? undefined : "Hulian Admin"} />

// Authentication page
<Brand size="lg" name="Hulian Admin" description="v0.18.0" />

// Animated brand (GIF / APNG / animated WebP): pass it as an img and it plays;
// wrap it in <picture> to give users with reduced motion enabled a static fallback
<Brand
  name="Hulian Admin"
  mark={
    <picture>
      <source srcSet="/brand-static.png" media="(prefers-reduced-motion: reduce)" />
      <img src="/brand-motion.gif" alt="" />
    </picture>
  }
/>

// Video brand: muted autoplay loop plus a poster. <video> has no native reduced-motion
// fallback, so decide autoplay with the exported usePrefersReducedMotion (it rests on the poster otherwise)
const reduced = usePrefersReducedMotion();
<Brand
  name="Hulian Admin"
  mark={<video src="/brand.webm" poster="/brand-static.png" autoPlay={!reduced} muted loop playsInline />}
/>
```

## Usage guidelines

- **When `name` is present, the badge is decorative** and receives `aria-hidden`; the name supplies the accessible identity. In a mark-only collapsed state, make `mark` meaningful or provide an `aria-label` on the root.
- The badge uses `--color-primary-foreground` over its background. Check contrast when supplying a custom mid-luminance color.
- Pass brand images, animated images, and video through `mark={<img ... />}`, `<picture>`, `<video>`, or `<canvas>`. The component already fills the badge and applies `object-cover`, so do not add another size wrapper. Self-drawn animations that render a `<div>` (Lottie and similar) are outside this rule; give the container `className="size-full"`.
- **Animated marks need a reduced-motion fallback.** For image formats wrap them in `<picture>` with `<source media="(prefers-reduced-motion: reduce)">`; the browser switches natively with no JavaScript (Chrome picks the source at page load; changing the OS preference mid-session is not guaranteed to re-select until a reload). `<video>` can only be handled by toggling `autoPlay` with `usePrefersReducedMotion`; CSS cannot pause it.
- The badge is square, so non-square assets are cropped by `object-cover`. Export a square version of an animated logo. GIF's 1-bit transparency exposes the badge background (`color`) along the edges, so prefer APNG or animated WebP for transparent edges, or export an opaque version.

## Related
[Avatar](../avatar/avatar.md) · [Navbar](../navbar/navbar.md) · [NavMenu](../nav-menu/nav-menu.md) · [AdminLayout](../admin-layout/admin-layout.md) · [BeianFooter](../beian-footer/beian-footer.md) · [LoginForm](../login-form/login-form.md)
