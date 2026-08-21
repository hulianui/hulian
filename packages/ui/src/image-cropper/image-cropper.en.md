---
slug: image-cropper
name: ImageCropper
category: forms
group: advanced
tags: []
exports: [ImageCropper, cropImageToBlob]
status: enriched
---

# ImageCropper

> Lets users pan, pinch, zoom, and crop an image to a fixed ratio before Blob export. · forms/advanced

## When to use

Use ImageCropper for avatars, ID photos, or covers that must be cropped to a fixed ratio and constrained before upload. Given an image and ratio, it lets the user pan and zoom, then returns a target-size Blob through `onCropped`. It commonly follows [Upload](../upload/upload.md): convert the selected File to an object URL and pass it to `image`.

## Import
```ts
import { ImageCropper, cropImageToBlob } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| image* | `string` | - | Image source: object URL / data URL / origin address |
| aspect | `number` | `5/7` | Cropping frame aspect ratio (identity photo 1 inch/2 inches same ratio) |
| outputWidth | `number` | `413` | The output bitmap width (px), the height is rounded according to the aspect derivation (2 inches @300DPI) |
| outputType | `string` | `"image/jpeg"` | output mime |
| quality | `number` | `0.9` | Encoding quality 0-1 |
| maxBytes | `number` | - | Upper limit of output bytes (such as `200*1024`): If the limit is exceeded, the quality will be reduced and try again. |
| maxZoom | `number` | `3` | Maximum zoom factor |
| cropAreaClassName | `string` | `h-64 sm:h-80` | Cropping canvas area height class |
| className | `string` | - | Container class name |

## Events

| Event | Type | Description |
|------|------|------|
| onCropped* | `(blob: Blob) => void` | Confirm Cropping: Output Target Size Blob |
| onCancel | `() => void` | Cancel button click (if not passed, the cancel button will not be rendered) |
| onError | `(error: unknown) => void` | Canvas export failed (extremely old browsers/canvas limited) |

## Slots

| Slot | Type | Description |
|------|------|------|
| confirmLabel | `ReactNode` | Confirm button copy (default `"confirm"`) |
| cancelLabel | `ReactNode` | Cancel button copy (default `"Cancel"`) |

## Examples
```tsx
<ImageCropper
  image={objectUrl}
  aspect={5 / 7}
  maxBytes={200 * 1024}
onCropped={(blob) => /* Storage/Upload */}
onCancel={() => /* Close */}
/>
```

Square avatar:
```tsx
<ImageCropper image={objectUrl} aspect={1} onCropped={save} />
```

## Usage guidelines

- `image` must be readable by Canvas through same-origin, object, or data URLs. Cross-origin images without CORS headers taint the canvas and make export fail through `onError`.
- `maxBytes` is best-effort. If the first export exceeds the limit, quality is reduced once (quality×0.72, minimum 0.5). The second result is returned even if it still exceeds the limit.
- If `onCancel` is not passed, the cancel button will not be rendered (single action scene).

## Related
[SecretField](../secret-field/secret-field.md) · [Combobox](../combobox/combobox.md) · [Listbox](../listbox/listbox.md) · [Mentions](../mentions/mentions.md) · [InputOTP](../input-otp/input-otp.md) · [Rating](../rating/rating.md)
