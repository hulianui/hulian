---
slug: progress
name: Progress
category: feedback
group: loading
tags: []
exports: [Progress, progressPercent, dashOffset]
status: enriched
---

# Progress

> Progress · Linear or circular determinate and indeterminate geometry with reduced-motion support · feedback/loading

## When to use

Use Progress for a measurable task with `value` and `max`, such as upload, form completion, or quota use, or omit value for indeterminate loading. Use [Spin](../spin/spin.md) or [Spinner](../spinner/spinner.md) when only a busy state is known.

## Import
```ts
import { Progress, progressPercent, dashOffset } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| value | `number` | — | Current value. Omit or pass undefined for indeterminate mode. |
| max | `number` | `100` | Maximum value. |
| variant | `"linear" \| "circular"` | `"linear"` | Geometry. |
| tone | `"primary" \| "danger" \| "success" \| "warning"` | `"primary"` | Progress tone. |
| size | `number` | `40` | Circular diameter in pixels; ignored by linear. |
| thickness | `number` | `4` | Circular stroke width in pixels; ignored by linear. |
| showValue | `boolean` | `false` | Shows the percentage at the circular center or linear right edge; ignored when indeterminate. |

> Inherits `HTMLAttributes<HTMLDivElement>`. Give the linear variant a width, such as `className="w-64"`.

## Example
```tsx
<Progress value={60} showValue className="w-64" />
<Progress variant="circular" value={75} showValue />
<Progress className="w-64" />            {/* Indeterminate: value omitted */}
```

## Usage guidelines

- The circular SVG ring begins at 12 o'clock using the SVG `transform="rotate(…)"` attribute, not CSS transform. When changing geometry, see [[svg-circular-progress-ring-rotate-via-svg-attr-not-css]]; CSS transform-origin does not behave reliably on SVG geometry elements.
- `showValue` has no effect in indeterminate mode because no percentage exists.

## Related
[Spin](../spin/spin.md) · [Spinner](../spinner/spinner.md) · [Dialog](../dialog/dialog.md) · [Modal](../modal/modal.md) · [AlertDialog](../alert-dialog/alert-dialog.md) · [Drawer](../drawer/drawer.md)
