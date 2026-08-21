---
slug: spin
name: Spin
category: feedback
group: loading
tags: []
exports: [Spin]
status: enriched
---

# Spin

> Overlays a loading indicator on existing content while preserving its layout. · feedback/loading

## When to use

Use Spin to cover a region while a table or card refreshes, blocking pointer interaction with a translucent overlay, spinner, and optional message. Use [Spinner](../spinner/spinner.md) for a bare inline loading icon or [Progress](../progress/progress.md) when completion is measurable.

## Import
```ts
import { Spin } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| spinning | `boolean` | `true` | Whether loading is active. |
| delay | `number` | `0` | Milliseconds loading must persist before the overlay appears. |
| size | `"sm"\|"md"\|"lg"` | `"md"` | Size forwarded to the internal Spinner. |
| fullscreen | `boolean` | `false` | Uses a fixed viewport overlay and ignores children. |
| className | `string` | - | Container class name. |

## Slots

| Slot | Type | Description |
|------|------|------|
| tip | `ReactNode` | Loading copy centered below the Spinner. |
| children | `ReactNode` | Covered content; without it, Spin becomes a standalone indicator. |

## Example
```tsx
<Spin spinning={loading} tip="Loading…"><ReportTable /></Spin>

{busy && <Spin fullscreen tip="Loading…" />}
```

## Usage guidelines

- `fullscreen` ignores children and covers the viewport; fullscreen and wrapped-content use are mutually exclusive.
- Use `delay` to prevent a flash for fast requests. Use zero for work that should report loading immediately.
- Without children, Spin is effectively a Spinner with a tip.
- No other known caveats.

## Related
[Spinner](../spinner/spinner.md) · [Progress](../progress/progress.md) · [Dialog](../dialog/dialog.md) · [Modal](../modal/modal.md) · [AlertDialog](../alert-dialog/alert-dialog.md) · [Drawer](../drawer/drawer.md)
