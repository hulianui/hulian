---
slug: callout
name: Callout
category: feedback
group: message
tags: []
exports: [Callout]
status: enriched
---

# Callout

> Admonition for articles and documentation · feedback/prompt

## When to use

Use Callout to emphasize a tip, pitfall, correct approach, or warning within long-form documentation. Only the title and icon take the tone color; foreground body copy remains readable beside an accent border and very light tone background. Use Alert when the whole notification should carry the tone. Callout is deliberately restrained for the reading flow.

## Import
```ts
import { Callout } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| tone | `"tip"｜"info"｜"warning"｜"success"｜"danger"` | `"tip"` | Tip/info use the primary color; warning, success, and danger use their semantic tones. |
| className | `string` | — | Forwarded to the root container. |

## Slots

| Slot | Type | Description |
|------|------|------|
| icon | `ReactNode` | Caller-provided emoji or SVG; the design system does not bind an icon library. |
| title | `ReactNode` | Tone-colored title. |
| children | `ReactNode` | Readable foreground body content. |

## Example
```tsx
<Callout tone="warning" icon="⚠️" title="Caution">
  This step rewrites existing data. Create a backup first.
</Callout>

<Callout tone="danger" title="Pitfall">
  A bare <code>var(--primary)</code> value does not resolve in SVG fill; include the --color- prefix.
</Callout>
```

## Usage guidelines

- Callout is presentational and consumes semantic tokens, including success, warning, and danger. Change theme tokens instead of applying inline color overrides.
- When both `title` and `icon` are absent, only the body renders, which suits a single understated note.

## Related
—
