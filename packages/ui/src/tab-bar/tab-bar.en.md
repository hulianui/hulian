---
slug: tab-bar
name: TabBar
category: mobile
group: nav
tags: []
exports: [TabBar]
status: enriched
---

# TabBar

> Bottom navigation · Controlled or uncontrolled items + active `aria-current` state + badge/dot + bottom safe area (zero dependencies · mobile primary navigation) · mobile/nav

## When to Use

Use it for top-level mobile navigation such as Home, Discover, and Profile. Use [Fab](../fab/fab.md) for a single contextual action, or [ActionSheet](../action-sheet/action-sheet.md) for a temporary list of actions.

## Import
```ts
import { TabBar } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| `items` * | `TabBarItem[]` | — | Page tag data (see below) |
| `value` | `string` | — | Controlled activation key |
| `defaultValue` | `string` | First key | Uncontrolled initial key |
| `safeArea` | `boolean` | `true` | Adds the bottom safe-area inset |
| `fixed` | `boolean` | `true` | fixed to the bottom; false to follow the document flow |
| `aria-label` | `string` | Locale value | Accessible navigation landmark label; an explicit value takes precedence. |
| `className` | `string` | — | — |

**TabBarItem**

| Name | Type | Default | Description |
|------|------|------|------|
| key * | `string` | — | Unique key, also the value used by `value`. |
| label * | `ReactNode` | — | Tab text. |
| icon | `ReactNode` | — | Default-state icon. |
| activeIcon | `ReactNode` | Reuses `icon` | Active-state icon. |
| dot | `boolean` | `false` | Red-dot indicator. |
| badge | `ReactNode` | — | Corner-mark content (number or text); takes precedence over `dot`. |
| disabled | `boolean` | `false` | Disables the tab. |

## Events

| Event | Type | Description |
|------|------|------|
| `onChange` | `(key: string) => void` | Switch tab callback |

## Examples
```tsx
const [tab, setTab] = useState("home");

<TabBar
  value={tab}
  onChange={setTab}
  items={[
    { key: "home", label: "Home", icon: <Home /> },
    { key: "me", label: "Profile", icon: <User />, badge: 5 },
  ]}
/>
```

## Usage Guidelines
- Default `fixed` sticks to the bottom of the viewport + eats the bottom safe area. When putting it into a mobile phone frame/container for demonstration, `fixed={false}` must be included in the document flow, otherwise it will float to the bottom of the page; add `safeArea={false}` when no safe area is needed in the container.
- When `badge` and `dot` are supplied at the same time, `badge` takes priority.
- The navigation landmark follows `ConfigProvider locale`; `enUS` provides “Bottom navigation”, and the no-provider fallback remains Chinese.

## Related
[Fab](../fab/fab.md) · [ActionSheet](../action-sheet/action-sheet.md) · [Picker](../picker/picker.md) · [SwipeAction](../swipe-action/swipe-action.md) · [PullToRefresh](../pull-to-refresh/pull-to-refresh.md) · [SafeArea](../safe-area/safe-area.md)
