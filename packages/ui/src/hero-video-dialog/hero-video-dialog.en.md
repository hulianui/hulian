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

> Opens a video from a thumbnail and play button in a modal player. · feedback/overlay

## When to use

Use HeroVideoDialog on a landing or marketing page to present a video thumbnail and play button that opens a video in a Portal modal. It closes on Escape or overlay click and locks background scrolling. Both kinds of video source work: a third-party embed page (a YouTube or Bilibili embed URL, hosted in an iframe) and a self-hosted video file (`.mp4`, `.webm`, and so on, played by a native `<video>` element). Use [Dialog](../dialog/dialog.md) for arbitrary modal content, or the Video component for full playback controls such as progress, speed, and picture-in-picture, or for HLS streams.

## Import
```ts
import { HeroVideoDialog } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| thumbnailSrc* | `string` | - | Thumbnail URL. |
| thumbnailAlt | `string` | `""` | Thumbnail alternative text; empty by default, so provide meaningful text unless the thumbnail is decorative. |
| videoSrc* | `string` | - | Video address. In embed form it is the iframe source, such as a YouTube or Bilibili embed URL; in video form it is a video file address such as `.mp4` or `.webm`. |
| videoType | `"auto" \| "embed" \| "video"` | `"auto"` | What the dialog plays with. `"embed"` mounts an iframe, `"video"` mounts a native `<video>` element, and `"auto"` decides from the `videoSrc` extension (`.mp4`, `.webm`, `.ogv`, `.ogg`, `.mov`, and `.m4v` become `"video"`; everything else becomes `"embed"`). |
| className | `string` | - | Additional class name, including thumbnail sizing. |

The built-in Chinese labels are `"\u64ad\u653e\u89c6\u9891"` (“Play video”) on the play control, `"\u5173\u95ed"` (“Close”) on the dismiss control, and `"\u89c6\u9891"` (“Video”) as the iframe title or the accessible name of the `<video>` element.

## Example
```tsx
// Self-hosted video file: auto resolves to video, so the dialog holds a native
// player and the thumbnail doubles as its poster.
<HeroVideoDialog thumbnailSrc="/cover.jpg" thumbnailAlt="Preview" videoSrc="/hero.mp4" className="w-80" />

// Third-party embed page: the embed URL carries no video extension, so auto
// resolves to embed and the dialog holds an iframe.
<HeroVideoDialog thumbnailSrc="/cover.jpg" thumbnailAlt="Preview" videoSrc="https://www.youtube.com/embed/dQw4w9WgXcQ" className="w-80" />
```

## Usage guidelines

- When you point at a third-party platform, `videoSrc` must be an **embed** URL such as `.../embed/...`, not a normal watch-page URL, or the iframe can fail to load.
- Automatic resolution reads the extension and nothing else. If the video file sits behind an address with no extension, such as `/api/video?id=1` or a signed direct link, `"auto"` resolves to embed and mounts an iframe. The browser media viewer still plays it, so the picture looks fine while the poster is gone and the controls are unstyled, which means **you cannot tell from the page that the wrong form was chosen**. Pass `videoType="video"` explicitly for those addresses.
- In the other direction, if an embed URL happens to contain a path segment such as `.mp4`, `"auto"` resolves to video by mistake. Pass `videoType="embed"` explicitly.
- HLS (`.m3u8`) is deliberately outside automatic resolution, because only Safari plays it natively while Chrome and Firefox need hls.js. Use the Video component for HLS instead of forcing `videoType="video"`.
- With `videoType="video"` the `<video>` element in the dialog carries `autoPlay`. If the browser autoplay policy blocks it, the controls are still there and one click starts playback.
- Size the thumbnail through `className`, for example `w-80`; the component sets no fixed width.

## Related
[Dialog](../dialog/dialog.md) · [Modal](../modal/modal.md) · [AlertDialog](../alert-dialog/alert-dialog.md) · [Drawer](../drawer/drawer.md) · [Popover](../popover/popover.md) · [Tooltip](../tooltip/tooltip.md)
