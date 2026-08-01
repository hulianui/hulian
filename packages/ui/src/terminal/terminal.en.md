---
slug: terminal
name: Terminal
category: mockups
group: window
tags: [animated]
exports: [Terminal]
status: enriched
---

# Terminal

> Terminal box · mac window shell + command line reveal line by line (motion + tone) + syntax coloring (command name/flag/URL/number) · mockups/window · #animated

## When to Use

Display terminal fragments such as installation commands, CLI output, build logs, etc., and reveal step-by-step animations and color them by tone (command/output/success). They are often used in the "Quick Start" and "Installation" sections of landing pages. This is a read-only visual demonstration box, not an interactive terminal (if you want real terminal capabilities, look for an xterm solution); to include web page screenshots, use [Safari](../safari/safari.md)/[Chrome](../chrome/chrome.md).

## Import
```ts
import { Terminal } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| lines* | `TerminalLine[]` | — | Array of rows to be revealed row by row (see table below). |
| lineDelay | `number` | `0.4` | Delay between adjacent lines in seconds |
| title | `string` | `"bash"` | Title-bar text |
| highlight | `boolean` | `true` | Command line/output line syntax coloring (command name/--flag/URL/number/quote string removal --code-* token); only effective for command/muted lines where text is a string, the tone color of the entire line such as success is not separated. |
| className | `string` | — | Additional class name for the root container |

`TerminalLine`:
| Field | Type | Description |
|------|------|------|
| text* | `ReactNode` | Line of text. |
| prompt | `string` | Start of line prompt (such as `"$"`, `">"`), none by default. |
| tone | `"command" \| "muted" \| "success"` | The tone of this line: command (foreground) / muted (secondary output) / success. |

## Examples
```tsx
<Terminal
  lines={[
    { prompt: "$", text: "pnpm add @hulianui/ui", tone: "command" },
    { text: "✓ Installation completed", tone: "success" },
    { prompt: "$", text: "pnpm dev", tone: "command" },
    { text: "▲ Next.js ready on http://localhost:5512", tone: "muted" },
  ]}
/>
```

## Usage Guidelines

- Syntax coloring only splits words for lines where `text` is a string and tone is command/muted; the entire line where ReactNode or success is passed is colored with tone, and no secondary coloring is performed.
- The line-by-line reveal is a motion client animation, and the host file needs to be `"use client"` (declared by the component itself).

## Related
[Safari](../safari/safari.md) · [Chrome](../chrome/chrome.md) · [iPhone](../iphone/iphone.md) · [Android](../android/android.md) · [Tablet](../tablet/tablet.md) · [Watch](../watch/watch.md)
