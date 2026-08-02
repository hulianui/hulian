---
slug: nav-menu
name: NavMenu
category: navigation
group: global
tags: []
exports: [NavMenu]
status: enriched
---

# NavMenu

> Sidebar navigation · Dependency-free inline accordion or collapsed icon flyouts, tree data, controlled selection and expansion, CSS grid height transitions, and WAI-ARIA tree keyboard navigation · navigation/global

## When to use

Use NavMenu for a multilevel sidebar in an admin application. It supports expanded inline navigation, collapsed icon flyouts, controlled or uncontrolled selection and expansion, and trailing row actions such as deleting a conversation. Use [Navbar](../navbar/navbar.md) for a horizontal top bar, [NavigationMenu](../navigation-menu/navigation-menu.md) for navigation with dropdown panels, or [Menu](../menu/menu.md) for contextual actions.

## Import
```ts
import { NavMenu } from "@hulianui/ui"
```

## Props

Each `items` entry is a `NavMenuNode = NavMenuItem | NavMenuGroup`. `NavMenuItem` is `{ key; label; icon?; href?; disabled?; actions?; children? }`: an item with `children` expands, while an item with `href` renders an `<a>` instead of a `<button>`. `NavMenuGroup` is `{ type:"group"; key; label; children }`; it renders a non-collapsible heading whose key does not participate in selection or expansion. NavMenu inherits native `<nav>` attributes except `onSelect`.

| Name | Type | Default | Description |
|------|------|------|------|
| items* | `NavMenuNode[]` | — | Hierarchical menu data. |
| mode | `"inline" \| "collapsed"` | `"inline"` | Inline accordion or collapsed sidebar icons with flyout submenus. Both modes support unlimited depth. |
| selectedKeys | `string[]` | — | Controlled selected keys. |
| defaultSelectedKeys | `string[]` | — | Initial selected keys when uncontrolled. |
| openKeys | `string[]` | — | Controlled expanded keys in inline mode. |
| defaultOpenKeys | `string[]` | — | Initial expanded keys when uncontrolled. |

## Events

| Event | Type | Description |
|------|------|------|
| onSelect | `(key: string, item: NavMenuItem) => void` | Called when a leaf item is selected. |
| onOpenChange | `(openKeys: string[]) => void` | Called when inline expansion changes. |

## Example
```tsx
// Controlled selection with trailing delete actions.
// The actions slot can use the group-hover/nav-row hook to appear on hover.
function ConvoNav() {
  const [sel, setSel] = useState<string[]>(["c1"]);
  return (
    <NavMenu
      items={[
        {
          type: "group",
          key: "today",
          label: "Today",
          children: [
            { key: "c1", label: "Integrating the Hulian component library", actions: <DeleteAction /> },
            { key: "c2", label: "Polish my weekly update", actions: <DeleteAction /> },
          ],
        },
      ]}
      selectedKeys={sel}
      onSelect={(k) => setSel([k])}
    />
  );
}
```

## Usage guidelines

The default navigation accessibility label follows `ConfigProvider` (`"Sidebar navigation"` in `enUS`, Chinese in `zhCN`). An explicit `aria-label` still takes precedence.

- Put trailing controls in `actions`; the component positions them outside the tree-item button or link. **Do not put interactive elements such as `<button>` directly inside `label`**. That creates invalid nested controls and can cause hydration errors. Actions are available only in inline mode.
- Expansion uses a CSS `grid-template-rows` transition from `0fr` to `1fr`, avoiding JavaScript height measurement and preserving smooth nested expansion. See [[nested-collapsible-height-via-css-grid-rows-not-js-measure]].
- Use either controlled state (`selectedKeys` or `openKeys` plus callbacks) or uncontrolled initial state (`default*`) for each dimension, not both.
- Collapsed flyouts support unlimited cascading depth and keep the whole tree mounted. CSS `:hover` and `:focus-within` expose each level. Keyboard navigation follows cascading-menu behavior: `→` enters a child level; `←` or `Esc` returns; `↑` and `↓` move only among siblings; and `Home` or `End` moves to the first or last item at the current level. Roving tabindex provides one tab stop for the whole tree, so do not expect Tab to visit every flyout entry.
- The first collapsed flyout uses `position: fixed` with measured coordinates. This prevents a scrollable sidebar ancestor, including AdminLayout's ScrollArea, from clipping the panel. Deeper levels remain `absolute`. Coordinates update on captured `scroll` and `resize` events; a custom scroller that emits no scroll event can leave the panel misaligned.
- `openKeys` applies only to inline mode. Collapsed visibility follows hover and focus, does not enter `openKeys`, and does not call `onOpenChange`.
- Native menubar, SwiftUI, and Tauri menu caveats do not apply; this is a React WAI-ARIA tree.

## Related
[Navbar](../navbar/navbar.md) · [BeianFooter](../beian-footer/beian-footer.md) · [NavigationMenu](../navigation-menu/navigation-menu.md) · [Menu](../menu/menu.md) · [Menubar](../menubar/menubar.md) · [Dock](../dock/dock.md)
