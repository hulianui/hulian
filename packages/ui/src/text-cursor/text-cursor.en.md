---
slug: text-cursor
name: TextCursor
category: typography
group: text
tags: [animated]
exports: [TextCursor]
status: enriched
---

# TextCursor

> Cursor glyph trail · drops glyphs along pointer movement, then floats, fades, and recycles them + direction-aware rotation + configurable spacing and cap + reduced-motion fallback · typography/text · #animated

## When to use

Use TextCursor to leave a glyph or emoji trail while the pointer moves within an interactive hero or landing-page region. It affects only movement inside its container. Use [BlobCursor](../blob-cursor/blob-cursor.md) to change the cursor itself, or [TextPressure](../text-pressure/text-pressure.md) for pointer-distance text deformation.

## Import
```ts
import { TextCursor } from "@hulianui/ui"
```

## Props

Inherits `Omit<HTMLAttributes<HTMLDivElement>, "children">`, additionally:

| Name | Type | Default | Description |
|------|------|------|------|
| text | `string` | `"\u745a"` | Glyph or short string left by the cursor; the built-in Chinese character is the first character of “Hulian,” and emoji such as `"✨"` are supported. |
| spacing | `number` | `80` | Minimum pixel spacing between adjacent glyphs; a new glyph will be placed every time the cursor moves full spacing. The smaller the glyph, the denser it is. |
| followMouseDirection | `boolean` | `true` | Whether the glyph is rotated and aligned along the moving direction (atan2); if off, it remains horizontal |
| randomFloat | `boolean` | `true` | After the glyph settles, it randomly floats (displacement + light rotation breathing); it is automatically deactivated under reduced-motion and only fades out. |
| exitDuration | `number` | `0.5` | Glyph fade-out seconds (opacity transition duration) |
| removalInterval | `number` | `30` | Trailing reduction polling interval (ms); remove a glyph from the head of the queue every this value after the cursor is stationary for ~100ms |
| maxPoints | `number` | `5` | The upper limit of glyphs that exist at the same time. If the glyph exceeds the limit, the oldest is discarded. |
| fontSize | `string` | `"1.875rem"` | Font size (any CSS length) |

## Slots

| Slot | Type | Description |
|------|------|------|
| children | `ReactNode` | Centered content (prompt/title) in the container does not affect the trailing layer |

## Example
```tsx
// Move the cursor inside the area to leave a glyph trail
<div className="relative h-64 overflow-hidden rounded-xl">
  <TextCursor>
    <p className="text-sm text-muted">Move the cursor within this area →</p>
  </TextCursor>
</div>

// emoji + large spacing (sparse tailing)
<TextCursor text="✨" spacing={130} />
```

## Usage guidelines

- The parent needs an explicit height, `overflow-hidden`, and positioning context. The trail layer is absolutely positioned and remains invisible if its container has no height.
- Glyphs are emitted only while the pointer moves inside the container. Leaving stops emission and existing glyphs recycle gradually.
- Reduced-motion mode removes random floating and retains only the fade-out.

## Related
[Text](../text/text.md) · [Heading](../heading/heading.md) · [Prose](../prose/prose.md) · [Markdown](../markdown/markdown.md) · [AuroraText](../aurora-text/aurora-text.md) · [AnimatedShinyText](../animated-shiny-text/animated-shiny-text.md)
