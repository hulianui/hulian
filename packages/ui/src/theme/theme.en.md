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
| forcedTheme | `"light" \| "dark"` | - | Force the resolved theme, for example per route. `setTheme` and `toggle` still save preferences but do not change the displayed theme while this prop is set. |

## Slots

| Slot | Type | Description |
|------|------|------|
| children* | `ReactNode` | Wrapped subtree |

Context values returned by `useTheme()`: `theme` (resolved `"light" | "dark"` value), `setting` (saved preference, including `"system"`), `setTheme(s)`, and `toggle()`.

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
- ThemeProvider is a client component. Mount it at a client boundary rather than directly inside a server-only Next.js App Router subtree.
- During SSR and the first render, `system` resolves to `light` to avoid hydration mismatches in theme-dependent UI such as toggle icons. The mount effect then applies the actual system theme, so do not use the first-frame `theme` value for critical rendering branches.
- While `forcedTheme` is set, `setTheme` and `toggle` update the saved preference without changing `data-theme`. Theme controls therefore appear visually unchanged until the forced value is removed.
- `forcedTheme` locks the resolved visual theme but still allows `setTheme` and `toggle` to update the saved preference for later use.

## Related
None.
