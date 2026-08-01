---
slug: log-viewer
name: LogViewer
category: data-display
group: collection
tags: []
exports: [LogViewer, levelClass]
status: enriched
---

# LogViewer

> A data-driven log viewer with structured lines, level colors, sticky auto-scroll, optional timestamps, and wrapping or horizontal scrolling.

## When to use

Use LogViewer for structured build, CI, and runtime streams that need level styling, timestamps, and bottom-following behavior. It renders real log data; use a terminal mockup for decorative typing demos, or [Conversation](../conversation/conversation.md) for AI chat.

## Import
```ts
import { LogViewer, levelClass } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| lines* | `LogLine[]` | — | Data-driven log lines. |
| showTimestamp | `boolean` | `false` | Shows each timestamp before its line. |
| autoScroll | `boolean` | `true` | Follows new lines only while the user is already at the bottom; scrolling up pauses following until they return. |
| maxLines | `number` | — | Renders only the last N lines; `0` or omission keeps all lines. The input array is unchanged. |
| wrap | `boolean` | `false` | Wraps long lines; otherwise they scroll horizontally. |
| height | `number \| string` | `320` | Scroll-region height. |
| className | `string` | — | Custom class name. |

`LogLine` is `{ level?: LogLevel; message: ReactNode; timestamp?: string; source?: string }`.
`LogLevel` is `"info"｜"warn"｜"error"｜"debug"｜"success"｜"command"` (`info` by default; `command` highlights executed commands or prompt lines, while `source`, such as `"[build]"`, is muted before the message).

## Examples
```tsx
<LogViewer
  lines={[
    { level: "command", timestamp: "12:00:01", message: "npm run build" },
    { level: "warn", timestamp: "12:00:05", source: "[ts]", message: "unused var 'x'" },
    { level: "error", timestamp: "12:00:10", source: "[lint]", message: "2 problems" },
    { level: "success", timestamp: "12:00:09", message: "compiled in 8.1s" },
  ]}
  showTimestamp
  height={220}
/>
```

For a stream, keep replacing `lines`; the component handles bottom-following:
```tsx
<LogViewer lines={STREAM.slice(0, n)} showTimestamp height={220} />
```

## Pitfalls

- Keep stream timing and append logic in the consumer; LogViewer only renders `lines` and follows the bottom.
- `autoScroll` is sticky, not forced. Its bottom check allows an 8 px tolerance for subpixel and inertial scrolling.
- Set `maxLines` for long-running streams to avoid accumulating tens of thousands of DOM nodes.
- ANSI escape sequences are not parsed. Strip them or map them to `LogLine.level` before rendering.
- With the default `wrap={false}`, long lines scroll horizontally. Enable wrapping in narrow containers when full text must remain visible.

## Related
[Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md)
