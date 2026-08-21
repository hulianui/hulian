---
slug: link
name: Link
category: navigation
group: action
tags: []
exports: [Link, linkVariants]
status: enriched
---

# Link

> Renders styled navigation with tone, underline, and external-link behavior. · navigation/action

## When to use

Use Link for inline navigation to internal or external destinations. It provides tone, underline policy, and secure external-link attributes. Use Button for an action such as submitting a form or opening a dialog; a Link should navigate.

## Import
```ts
import { Link, linkVariants } from "@hulianui/ui"
```

## Props

Inherits native `<a>` attributes such as `href`, `target`, and `onClick`, except native `color`. Adds:

| Name | Type | Default | Description |
|------|------|------|------|
| `tone` | `"primary" \| "foreground" \| "danger"` | `"primary"` | Text tone. |
| `underline` | `"always" \| "hover" \| "none"` | `"hover"` | Underline visibility policy. |
| `external` | `boolean` | `false` | Adds `target="_blank"`, `rel="noopener noreferrer"`, and a trailing external-link icon. |
| `href` | `string` | - | Native navigation destination. |
| `render` | `ReactElement` | - | Custom element for framework routers such as `next/link` or React Router Link. Styling and Link props merge into this element; the custom element owns `href`. |

## Events

| Event | Type | Description |
|------|------|------|
| `onClick` | `(e: MouseEvent<HTMLAnchorElement>) => void` | Native anchor click handler; other `onXxx` events also pass through. |

## Slots

| Slot | Type | Description |
|------|------|------|
| `children` | `ReactNode` | Link content. |

## Example
```tsx
<Link href="/docs">Hulian documentation</Link>
<Link href="https://base-ui.com" external>Base UI website</Link>
<Link href="#" underline="always" tone="danger">Deletion notes</Link>

// Client-side routing: pass the framework Link through render and put href on it
import NextLink from "next/link"
<Link render={<NextLink href="/posts/1" />}>View details</Link>
```

## Usage guidelines

- With `external`, do not repeat `target` or `rel`; the component injects safe values and the icon automatically.
- **For client routing, use `render` and put `href` on the rendered element.** In `<Link href="/a" render={<NextLink />}>`, the address remains on the HulianUI layer and does not reach the router component.
- Wrapping a router link around Link produces nested `<a>` elements, invalid DOM, and possible hydration errors.

## Related
[Command](../command/command.md) · [ContextMenu](../context-menu/context-menu.md) · [Toolbar](../toolbar/toolbar.md) · [Accordion](../accordion/accordion.md) · [Collapsible](../collapsible/collapsible.md) · [AnimatedThemeToggler](../animated-theme-toggler/animated-theme-toggler.md)
