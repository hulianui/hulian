---
slug: theme
name: Theme
category: uncatalogued
group:
tags: []
exports: [ThemeProvider]
status: enriched
---

# Theme

> Application theme state · Light, dark, and system preferences synchronized to `<html data-theme>` · uncatalogued

## When to Use

Wrap the application root in `ThemeProvider` to manage light, dark, and system preferences and synchronize the resolved theme to `<html data-theme>` for CSS tokens. Descendants read or change the setting through `useTheme()`. The provider does not prevent first-paint flicker by itself; use the page's anti-FOUC inline script to set `data-theme` before React mounts.

## Import
```ts
import { ThemeProvider } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| defaultSetting | `"light" \| "dark" \| "system"` | `"system"` | Initial theme preference; if localStorage(`hulian-theme`) has a value during mount, it will be overwritten by it |
| forcedTheme | `"light" \| "dark"` | — | Forced theme (such as theme by route): override user preferences and system monitoring; during this period, `setTheme`/`toggle` still writes preferences but does not change the visual |

## Slots

| Slot | Type | Description |
|------|------|------|
| children* | `ReactNode` | Wrapped subtree |

Context values returned by `useTheme()`: `theme` (actual topic after parsing `"light"|"dark"`), `setting` (user selection, including `"system"`), `setTheme(s)`, `toggle()`.

## Examples

```tsx
// apply root
import { ThemeProvider } from "@hulianui/ui";

export function App({ children }: { children: React.ReactNode }) {
  return <ThemeProvider defaultSetting="system">{children}</ThemeProvider>;
}
```

```tsx
// Switch theme from a descendant client component.
"use client";
import { useTheme } from "@hulianui/ui";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return <button onClick={toggle}>{theme === "dark" ? "Switch to light" : "Switch to dark"}</button>;
}
```

## Usage Guidelines

- `useTheme()` must be called within the `ThemeProvider` subtree, otherwise `"useTheme must be used within ThemeProvider"` will be thrown.
- This component is a `"use client"` client component and must be hung within the client boundary (do not put it directly into the pure server component tree under Next.js App Router).
- The first rendering `theme` takes a certain value (`system` is resolved to `light`), and does not adjust `systemTheme()` in the SSR/first frame to avoid theme-related rendering (such as toggler icons) triggering hydration mismatch (React #418); the real theme is immediately corrected by the mount effect. So don't rely on the `theme` value of the first frame for key rendering branches.
- The vision is locked after passing `forcedTheme`: `setTheme`/`toggle` only writes preferences without changing `data-theme`, and the theme-changing UI looks "invalid" during the enforcement period, which is expected behavior.
- `forcedTheme` locks the resolved visual theme but still allows `setTheme` and `toggle` to update the saved preference for later use.

## Related
—
