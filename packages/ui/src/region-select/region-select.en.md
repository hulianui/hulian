---
slug: region-select
name: RegionSelect
category: forms
group: advanced
tags: []
exports: [RegionSelect, toImagePoint, normalizeBox, applyAspect, boxMinSide, roundBox, strokeWidthFor]
status: enriched
---

# RegionSelect

> Image-region coordinate selector · Drag a box and receive original-image pixel coordinates `[x1,y1,x2,y2]` instead of a cropped Blob · Normalizes reverse drags, filters accidental points, constrains aspect ratio without breaking it at boundaries, overlays labeled read-only boxes, and scrolls tall images · SVG viewBox keeps box drawing in one coordinate system · Measures natural dimensions, supports touch and pointer capture, and scales strokes with image width · forms/advanced

## When to use

Use RegionSelect when an image region must be stored as coordinates: textbook image correction, document or defect annotation, OCR correction, screenshot redaction, or product hotspots.

Its output distinguishes it from [ImageCropper](../image-cropper/image-cropper.md). ImageCropper returns a finished bitmap through `onCropped(blob)`; RegionSelect returns coordinates. Keeping the original image plus a box lets someone correct the box later and lets a server render crops consistently. Use ImageCropper when only the finished image matters and its original location does not.

## Import
```ts
import { RegionSelect, type RegionBox } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| src* | `string` | - | Source image URL. |
| value | `RegionBox \| null` | - | Controlled current box in original-image pixels: `[x1,y1,x2,y2]`. |
| onChange | `(box: RegionBox) => void` | - | Called after a drag with a normalized and rounded box, including for reverse drags. |
| onDrafting | `(box: RegionBox \| null) => void` | - | Receives the live floating-point draft during a drag and `null` when it ends. It is not affected by `round`. |
| round | `"expand" \| "nearest" \| "none"` | `"expand"` | Output rounding: `expand` floors the top-left and ceils the bottom-right without shrinking; `nearest` rounds each coordinate; `none` preserves subpixel values. |
| minSide | `number` | `8` | Ignores a selection whose shorter side is below this many original-image pixels. Evaluated after rounding. |
| boxes | `{ box, color?, label?, id? }[]` | - | Other read-only boxes rendered with dashed outlines and optional labels. |
| aspect | `number` | - | Fixed width-to-height ratio. Omit for free-form selection. |
| naturalSize | `{ width, height }` | - | Known natural image dimensions. When omitted, the component measures them with `new Image()`. |
| maxHeight | `string \| number` | `"60vh"` | Internal scrolling limit for tall images. |
| color | `string` | `"primary"` | Main box outline color, accepting a semantic tone or arbitrary CSS color. |
| readOnly | `boolean` | `false` | Disables dragging while continuing to display existing boxes. |
| placeholder | `ReactNode` | Built-in loading copy | Content shown before natural dimensions are available. |
| errorPlaceholder | `ReactNode` | Built-in load-error copy | Content shown when the source fails because of HTTP, CORS, or network errors. |
| onError | `(event: unknown) => void` | - | Called when either image preloading or the SVG `<image>` fails. |
| alt | `string` | `""` | Accessible name for the canvas. |

### Exported pure functions

`toImagePoint(clientX, clientY, rect, w, h)` maps and clamps a pointer to image pixels. `normalizeBox(a, b)` creates a normalized box from two points. `applyAspect(anchor, point, aspect, w, h)` applies an aspect ratio within image bounds. `boxMinSide(box)`, `roundBox(box, mode?)`, and `strokeWidthFor(w)` expose the same geometry used by the component for custom renderers.

## Example
```tsx
const [box, setBox] = useState<RegionBox | null>(null)

<RegionSelect
  src={pageUrl}
  value={box}
  onChange={setBox}
  boxes={others}
  maxHeight="60vh"
/>
// Persist `box` directly as original-image pixels for the server-side crop endpoint.
```

## Usage guidelines

- **The only coordinate system is original-image pixels**, not container pixels or percentages. The component draws inside `<svg viewBox="0 0 naturalW naturalH">`, so boxes need no conversion; only pointer coordinates are mapped from the rendered rectangle to the source image.
- **No boxes render until natural dimensions are known.** Reusing the previous image's ratio would place them incorrectly. Pass `naturalSize` when it is already stored to avoid preloading and to make server rendering or tests independent of image decoding.
- **Committed coordinates are integers by default, while the drag preview remains floating point.** Database integer arrays, PIL/OpenCV/sharp crop APIs, and equality checks all need deterministic integer coordinates. The default `round="expand"` floors the top-left and ceils the bottom-right so rounding never shrinks a box below `minSide`. The `minSide` check therefore runs after rounding.
  - A 1:1 or integer scale hides this defect because mapped coordinates are already integers. Test a non-divisible scale; the library regression coverage uses 756 source pixels rendered at 396 pixels.
- **Pointer capture happens after drag state is established and is protected by try/catch.** Synthetic PointerEvents in browser automation and unit tests can throw from `setPointerCapture`; this must not cancel the drag handler.
- The canvas uses `touch-none` so a touch drag selects a region instead of scrolling the page.
- Outline width scales as `max(2, naturalW / 400)`, keeping boxes visible on wide scanned pages.
- **Loading and failure are separate states.** A missing, expired, unauthorized, or cross-origin image renders `errorPlaceholder` and calls `onError` instead of leaving someone waiting at the loading placeholder. Preloading and the SVG request share the same failure state, and changing `src` resets it.
- **Keyboard and screen-reader users cannot draw directly on a canvas.** Provide four numeric inputs bound to the same controlled `value` when the workflow needs a non-pointer alternative.

## Related
[ImageCropper](../image-cropper/image-cropper.md) · [ImageViewer](../image-viewer/image-viewer.md) · [Image](../image/image.md) · [Annotation](../annotation/annotation.md) · [Flow](../flow/flow.md)
