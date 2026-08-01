---
slug: app-launcher
name: AppLauncher
category: navigation
group: global
tags: []
exports: [AppLauncher, matchApp, filterApps, groupSections]
status: enriched
---

# AppLauncher

> Application launcher · Glass panel, searchable icon grid, category pills, controlled or uncontrolled filters, keyword aliases, contiguous sections, keyboard grid navigation, badges, links, disabled items, action slot, and pure filtering helpers · navigation/global

## When to use

Use AppLauncher for an application center, personal workspace, micro-app marketplace, or shortcut home page where people browse a full grid of recognizable app icons and filter by category or name.

[Command](../command/command.md) is a list-based, keyboard-driven command palette whose results are commands and actions. [Dock](../dock/dock.md) is a persistent single row of icons without categories or search. AppLauncher is the grid-based choice: large named icons arranged into optional sections for visual discovery rather than command entry.

## Import
```ts
import { AppLauncher, type AppLauncherItem } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| items* | `AppLauncherItem[]` | — | Application entries described below. |
| categories | `{ key, label }[]` | — | Category pills. The category row is omitted when this prop is absent. |
| category / defaultCategory | `string` | — | Controlled or initial uncontrolled category. `undefined` means all categories. |
| onCategoryChange | `(key?: string) => void` | — | Called when the category changes. |
| allLabel | `ReactNode` | `"\u5168\u90e8"` | Label for the all-categories pill. The built-in Chinese copy means “All.” |
| title | `ReactNode` | — | Heading at the upper left. A string title also becomes the search placeholder, matching macOS Launchpad. |
| logo / actions | `ReactNode` | — | Logo before the title and actions at the upper right. |
| searchable | `boolean` | `true` | Whether to render the search field. |
| search / defaultSearch | `string` | `""` | Controlled or initial uncontrolled search query. |
| onSearchChange | `(v: string) => void` | — | Called when the search query changes. |
| columns | `number` | `7` | Number of grid columns. |
| iconSize | `number` | `64` | Icon box size in pixels. |
| labelLines | `1 \| 2` | `1` | Maximum number of label lines before truncation. |
| variant | `"glass" \| "solid"` | `"glass"` | Translucent glass surface or opaque surface. |
| emptyText | `ReactNode` | `"\u6ca1\u6709\u5339\u914d\u7684\u5e94\u7528"` | Empty-result message. The built-in Chinese copy means “No matching applications.” |
| onItemClick / onItemContextMenu | `(item, event) => void` | — | Called for a click or context-menu action. |

When `title` is not a string, the search field falls back to the built-in Chinese placeholder and accessible label `"\u641c\u7d22\u5e94\u7528"`, meaning “Search applications.” The category group uses `"\u5e94\u7528\u5206\u7c7b"`, meaning “Application categories.”

### AppLauncherItem

| Field | Type | Description |
|------|------|------|
| id* | `string \| number` | Unique item key. |
| label* | `ReactNode` | Application name. |
| icon* | `ReactNode` | Icon content such as `<img>`, SVG, or emoji, clipped to a square with 22% corner rounding. |
| category | `string` | Category key. |
| section | `string` | Section key. Adjacent items with the same key form a group separated from the next group by a divider. |
| keywords | `string[]` | Search aliases such as transliterations, English names, or abbreviations. Non-string labels can only match through these keywords. |
| href / target | `string` | Renders the item as an `<a>` when `href` is provided. |
| badge | `ReactNode` | Badge at the upper-right corner of the icon. |
| disabled | `boolean` | Prevents activation and removes the item from the tab order. |

### matchApp / filterApps / groupSections

These exported pure functions implement keyword matching, category filtering, and contiguous section grouping. Use them when rendering a custom grid with the same behavior.

## Example
```tsx
<AppLauncher
  items={apps}
  categories={[{ key: "dev", label: "Developer tools" }, { key: "tool", label: "Utilities" }]}
  title="Applications"
  logo={<Logo />}
  actions={<MoreButton />}
  className="h-[28rem]"
  onItemClick={(app) => router.push(`/apps/${app.id}`)}
/>
```

## Usage guidelines

- **The `glass` variant needs visible artwork or texture behind it.** It uses `bg-surface/70` and backdrop blur. On a flat background it reads as a merely translucent panel; use `variant="solid"` there.
- Search matches Chinese labels by substring, not prefix. Put English, transliterated, and abbreviated aliases in `keywords` instead of appending them to `label`.
- Sections group only adjacent entries and never reorder the input. Array order is the display order, so a “Recently used” group remains first. Reusing a section name in non-adjacent runs intentionally creates separate groups.
- Icon rounding is fixed at 22% to approximate an Apple-style superellipse and does not use `var(--radius)`.
- Set the panel height through `className`, for example `h-[28rem]`. The grid scrolls inside that height; without a height constraint, content expands the panel.

## Related
[Command](../command/command.md) · [Dock](../dock/dock.md) · [Grid](../grid/grid.md) · [BentoGrid](../bento-grid/bento-grid.md) · [Empty](../empty/empty.md) · [Chip](../chip/chip.md)
