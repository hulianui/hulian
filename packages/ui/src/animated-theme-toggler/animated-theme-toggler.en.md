---
slug: animated-theme-toggler
name: AnimatedThemeToggler
category: navigation
group: action
tags: [animated]
exports: [AnimatedThemeToggler]
status: enriched
---

# AnimatedThemeToggler

> Theme toggle · Circular light/dark reveal using View Transitions and HulianUI `useTheme`, with a graceful fallback · navigation/action · #animated

## When to use

Use AnimatedThemeToggler for a header or settings control that switches light and dark themes with a circular reveal radiating from the button. For an unanimated switch or custom control, compose directly with `useTheme()`.

## Import
```ts
import { AnimatedThemeToggler } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| `theme` | `"light" ｜ "dark"` | — | Controlled theme. When set, the button's state and target are driven by this value, ignoring `ThemeProvider` / the standalone fallback; clicks only call `onThemeChange`. |
| `onThemeChange` | `(next: "light" ｜ "dark") => void` | — | Called with the next theme when a switch is requested. Fires in both modes; in controlled mode it is the only place the value lands. |
| `duration` | `number` | `500` | Circular reveal duration in milliseconds. |
| `className` | `string` | — | Button class name. |
| `aria-label` | `string` | — | Accessible label. |

Without `aria-label`, the button uses built-in Chinese state-dependent copy: `"\u5207\u6362\u5230\u4eae\u8272"` (“Switch to light”) in dark mode and `"\u5207\u6362\u5230\u6697\u8272"` (“Switch to dark”) otherwise.

## Example
```tsx
<AnimatedThemeToggler aria-label="Toggle light and dark theme" />

// Controlled: the theme source of truth lives with the consumer (API / own storage);
// ThemeProvider only mirrors it via forcedTheme
<AnimatedThemeToggler theme={theme} onThemeChange={(next) => savePreference(next)} />
```

## Usage guidelines

- The circular reveal uses the View Transitions API. Unsupported browsers switch instantly while preserving the theme change.
- The button position determines the reveal origin, so this is a client component. Use it below a `"use client"` boundary in an RSC tree.
- Without `ThemeProvider`, the component no longer throws. It falls back to local state, reads and writes `<html data-theme>`, uses the `hulian-theme` localStorage key, and warns in development. This fallback does not synchronize with other `useTheme` consumers; production applications should still install `ThemeProvider`.
- **Controlled mode (#284).** With `ThemeProvider forcedTheme`, `toggle` writes the preference without changing the visual theme, so an uncontrolled toggler plays the reveal but nothing switches. When the theme source of truth is outside the library (shell + iframes each mounting a `forcedTheme` provider fed from one place), pass `theme` + `onThemeChange`: the circular reveal is unchanged, only where the value lands is up to the consumer. Controlled mode never touches `useTheme().toggle` and never enters the standalone fallback.
- Use `useTheme` when application code must fail without a provider. Library components and tolerant integrations can use `useThemeOptional`, which returns `null` without context.

## Related

Default toggle labels follow `ConfigProvider` (`zhCN` / `enUS`); an explicit `aria-label` always wins.
[Command](../command/command.md) · [ContextMenu](../context-menu/context-menu.md) · [Toolbar](../toolbar/toolbar.md) · [Accordion](../accordion/accordion.md) · [Collapsible](../collapsible/collapsible.md) · [Link](../link/link.md)
