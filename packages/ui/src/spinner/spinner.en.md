---
slug: spinner
name: Spinner
category: feedback
group: loading
tags: []
exports: [Spinner, spinnerVariants]
status: enriched
---

# Spinner

> Loading spinner · CSS `animate-spin` SVG ring with `role=status` and localized accessibility copy · feedback/loading

## When to use

Use Spinner as a bare loading icon inside a button, inline status, or empty region. It is a CSS-animated SVG ring with `role=status` and no interaction. Use [Spin](../spin/spin.md) for overlays or fullscreen loading, and [Progress](../progress/progress.md) for known progress.

## Import
```ts
import { Spinner, spinnerVariants } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| size | `"sm"\|"md"\|"lg"` | `"md"` | Spinner size. |
| tone | `"primary"\|"current"\|"muted"` | `"primary"` | Color. `current` inherits `currentColor` for colored controls. |
| label | `string` | From `ConfigProvider` | Screen-reader status copy. Explicit values take precedence over the locale. |
| className | `string` | - | Container class name. |

## Example
```tsx
<Spinner />

<Button>
  <Spinner size="sm" tone="current" />
  Submitting
</Button>
```

## Usage guidelines

- Use `tone="current"` to inherit a button or link's foreground. The default primary tone is fixed.
- Spinner has no `spinning` switch: rendering it means spinning. Conditionally render it or use [Spin](../spin/spin.md)'s `spinning` prop.
- No other known caveats.

## Related
[Spin](../spin/spin.md) · [Progress](../progress/progress.md) · [Dialog](../dialog/dialog.md) · [Modal](../modal/modal.md) · [AlertDialog](../alert-dialog/alert-dialog.md) · [Drawer](../drawer/drawer.md)
