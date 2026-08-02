---
slug: hero-video-dialog
name: HeroVideoDialog
category: feedback
group: overlay
tags: []
exports: [HeroVideoDialog]
status: enriched
---

# HeroVideoDialog

> Video dialog · Thumbnail and play button opening a Portal modal with Escape/overlay dismissal and scroll locking · feedback/overlay

## When to use

Use HeroVideoDialog on a landing or marketing page to present a video thumbnail and play button that opens an embedded YouTube or Bilibili video in a Portal modal. It closes on Escape or overlay click and locks background scrolling. Use [Dialog](../dialog/dialog.md) for arbitrary modal content or the Video component for native playback controls such as progress, speed, and picture-in-picture.

## Import
```ts
import { HeroVideoDialog } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| thumbnailSrc* | `string` | — | Thumbnail URL. |
| thumbnailAlt | `string` | `""` | Thumbnail alternative text; empty by default, so provide meaningful text unless the thumbnail is decorative. |
| videoSrc* | `string` | — | iframe source, such as a YouTube or Bilibili embed URL. |
| className | `string` | — | Additional class name, including thumbnail sizing. |

The built-in Chinese labels are `"\u64ad\u653e\u89c6\u9891"` (“Play video”) on the play control, `"\u5173\u95ed"` (“Close”) on the dismiss control, and `"\u89c6\u9891"` (“Video”) as the iframe title.

## Example
```tsx
<HeroVideoDialog thumbnailSrc="/cover.jpg" thumbnailAlt="Preview" videoSrc="https://www.youtube.com/embed/dQw4w9WgXcQ" className="w-80" />
```

## Usage guidelines

- `videoSrc` must be an iframe **embed** URL such as `.../embed/...`, not a normal watch-page URL, or the iframe can fail to load.
- Size the thumbnail through `className`, for example `w-80`; the component sets no fixed width.

## Related
[Dialog](../dialog/dialog.md) · [Modal](../modal/modal.md) · [AlertDialog](../alert-dialog/alert-dialog.md) · [Drawer](../drawer/drawer.md) · [Popover](../popover/popover.md) · [Tooltip](../tooltip/tooltip.md)
