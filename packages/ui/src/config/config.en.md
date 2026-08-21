---
slug: config
name: Config
category: uncatalogued
group:
tags: []
exports: [ConfigProvider]
status: enriched
---

# Config

> Global configuration root · Currently supplies the i18n locale and leaves room for future global defaults · uncatalogued

## When to Use

Place it near the application root alongside ThemeProvider to supply the global locale. Override one component's copy through that component's props instead of changing the provider. ThemeProvider owns color mode and themes; Config currently owns only locale data.

## Import
```ts
import { ConfigProvider } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| locale | `Locale` | `zhCN` | Global Locale (customized with exported zhCN/enUS or spread) |

## Slots

| Slot | Type | Description |
|------|------|------|
| children* | `ReactNode` | Subtree |

## Examples
```tsx
import { ConfigProvider } from "@hulianui/ui";
// zhCN and enUS are exported from the same package.

// Place it near the application root beside ThemeProvider.
<ConfigProvider locale={enUS}>
  <App />
</ConfigProvider>

// zhCN is the default, so locale may be omitted.
<ConfigProvider>
  <App />
</ConfigProvider>
```

## Usage Guidelines

- Config currently supplies only the locale; it does not control component size or themes.
- Build a custom locale by spreading `zhCN` or `enUS` before overriding individual keys, so new or omitted keys retain a fallback.

## Related
None.
