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

> Brand identity · Square badge plus site name and optional description · Derives the badge from the first character of the name when mark is omitted · Three sizes for navigation, sidebars, and authentication pages · Custom badge color · Mark-only collapsed state · Native href or framework-router render slot · navigation/global

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
| mark | `ReactNode` | First character of `name` | Badge content such as an icon, image, or initial. |
| name | `ReactNode` | — | Brand name. Omit it to render only the badge in a collapsed sidebar. |
| description | `ReactNode` | — | One-line subtitle below the brand name, such as a version or positioning statement. |
| size | `"sm" \| "md" \| "lg"` | `"md"` | `sm` is a 28px navigation badge, `md` is a 36px sidebar badge, and `lg` is for authentication-page branding. |
| color | `string` | `"primary"` | Badge background. Accepts a semantic tone such as `chart-3` or any CSS color. |
| href | `string` | — | Native link target, normally the home page. |
| render | `ReactElement` | — | Renders through a framework router element such as `<Link to="/" />`, following the Button, Link, and NavMenuItem render contract. |
| className | `string` | — | Class name for the root; remaining native attributes are forwarded. |

## Example
```tsx
// Navigation bar
<Brand size="sm" mark={<Logo />} name="Hulian Admin" render={<Link to="/" />} />

// Sidebar: retain only the badge when collapsed
<Brand mark={<Logo />} name={collapsed ? undefined : "Hulian Admin"} />

// Authentication page
<Brand size="lg" name="Hulian Admin" description="v0.18.0" />
```

## Usage guidelines

- **When `name` is present, the badge is decorative** and receives `aria-hidden`; the name supplies the accessible identity. In a mark-only collapsed state, make `mark` meaningful or provide an `aria-label` on the root.
- The badge uses `--color-primary-foreground` over its background. Check contrast when supplying a custom mid-luminance color.
- Pass a brand image through `mark={<img ... />}`. The component already applies `size-full object-cover`, so do not add another size wrapper.

## Related
[Avatar](../avatar/avatar.md) · [Navbar](../navbar/navbar.md) · [NavMenu](../nav-menu/nav-menu.md) · [AdminLayout](../admin-layout/admin-layout.md) · [BeianFooter](../beian-footer/beian-footer.md) · [LoginForm](../login-form/login-form.md)
