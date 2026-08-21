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

> Sidebar navigation · Dependency-free inline accordion or collapsed icon flyouts, tree data, controlled selection and expansion, CSS grid height transitions, WAI-ARIA tree keyboard navigation, and `semantics="list"` for site-navigation list/link semantics · navigation/global

## When to use

Use NavMenu for a multilevel sidebar in an admin application. It supports expanded inline navigation, collapsed icon flyouts, controlled or uncontrolled selection and expansion, and trailing row actions such as deleting a conversation. Use [Navbar](../navbar/navbar.md) for a horizontal top bar, [NavigationMenu](../navigation-menu/navigation-menu.md) for navigation with dropdown panels, or [Menu](../menu/menu.md) for contextual actions.

## Import
```ts
import { NavMenu } from "@hulianui/ui"
```

## Props

Each `items` entry is a `NavMenuNode = NavMenuItem | NavMenuGroup`. `NavMenuGroup` is `{ type:"group"; key; label; children }`; it renders a non-collapsible heading whose key does not participate in selection or expansion. NavMenu inherits native `<nav>` attributes except `onSelect`.

| Name | Type | Default | Description |
|------|------|------|------|
| items* | `NavMenuNode[]` | - | Hierarchical menu data. |
| mode | `"inline" \| "collapsed"` | `"inline"` | Inline accordion or collapsed sidebar icons with flyout submenus. Both modes support unlimited depth. |
| semantics | `"tree" \| "list"` | `"tree"` | Accessibility model. In list mode, rows do not receive an overriding role, preserving native link semantics, and keyboard interaction returns to normal Tab order. Use `list` for site navigation and retain `tree` for true file or outline trees. |
| selectedKeys | `string[]` | - | Controlled selected keys. |
| defaultSelectedKeys | `string[]` | - | Initial selected keys when uncontrolled. |
| openKeys | `string[]` | - | Controlled expanded keys in inline mode. |
| defaultOpenKeys | `string[]` | - | Initial expanded keys when uncontrolled. |

`NavMenuItem`

| Name | Type | Default | Description |
|------|------|------|------|
| key * | `string` | - | Unique key, also the value used by selection and expansion state. |
| label * | `ReactNode` | - | Row text. |
| icon | `ReactNode` | - | Leading icon; in `collapsed` mode it is the only visible content. |
| href | `string` | - | Leaf link: with it the row renders an `<a>`, otherwise a `<button>`. Parent rows ignore it. |
| render | `ReactElement` | - | Renders a custom element such as a framework link (`<Link to=… />` / `<NextLink href=… />`). Skin classes, ref, keyboard-roving attributes, and the click callback are merged into it, so real link semantics (middle-click, copy address, link announcement) and client-side routing both work. Matches the `render` contract used by Button and Link. Parent rows (those with `children`) ignore it. |
| disabled | `boolean` | `false` | Not clickable and skipped by keyboard roving. |
| actions | `ReactNode` | - | Trailing action area such as delete or more buttons. It renders **outside** the row's treeitem button or link (absolutely positioned on the right), which keeps a `<button>` from being nested inside the treeitem button and producing invalid HTML or hydration errors. Use the exposed `group-hover/nav-row` hook for hover-only actions. Only effective in `inline` mode. |
| children | `NavMenuNode[]` | - | Child entries; their presence makes the row an expandable parent. |

## Events

| Event | Type | Description |
|------|------|------|
| onSelect | `(key: string, item: NavMenuItem) => void` | Called when a leaf item is selected. |
| onOpenChange | `(openKeys: string[]) => void` | Called when inline expansion changes. |

## Examples

### Site navigation (use `semantics="list"`)

```tsx
// A column of navigation links is a list of links, not a tree widget.
// Without semantics, the identical-looking default tree exposes no links to a screen reader.
<NavMenu
  semantics="list"
  selectedKeys={[pathname]}
  items={[
    { key: "/", label: "Dashboard", icon: <Home />, render: <Link to="/" /> },
    {
      key: "settings",
      label: "Settings",
      icon: <Settings />,
      children: [
        { key: "/settings/profile", label: "Profile", render: <Link to="/settings/profile" /> },
        { key: "/settings/security", label: "Security", render: <Link to="/settings/security" /> },
      ],
    },
  ]}
/>
```

### Conversation list with controlled selection and trailing actions

```tsx
// This is imperative selection through buttons, so the default tree semantics are appropriate.
// If conversations are links, use semantics="list" as in the site-navigation example.
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

### Framework routing through `render`

```tsx
{ key: "/user/balance", label: "Balance details", render: <Link to="/user/balance" /> }
```

`href` renders a native `<a>`, which causes a full-page navigation in an SPA. Using only `onSelect` and `navigate()` turns the row into a `<button>` and loses opening in a new tab or copying the link address. `render` preserves both sides: HulianUI merges its styling, keyboard attributes, and selection callback into the supplied element, running the consumer's `onClick` before internal selection (hulianui/hulian#59). This matches the `render` contract of [Button](../button/button.md) and [Link](../link/link.md).

> `render` alone does not make assistive technology announce the row as a link (hulianui/hulian#69). The default `semantics="tree"` adds `role="treeitem"`, and an explicit role overrides an `<a>` element's implicit link role. Pair framework links used for site navigation with `semantics="list"`.

### Semantic modes

| Mode | Structure | Keyboard | Use for |
|------|-----------|----------|---------|
| `"tree"` (default) | `role=tree`, `treeitem`, and `aria-selected` | One roving Tab stop for the tree; arrow-key navigation | File trees and outline trees that are genuine tree widgets |
| `"list"` | `role=list`; rows have no overriding role, so `<a>` remains a link and `<button>` remains a button; selected links use `aria-current="page"` | Normal Tab order and native activation; NavMenu does not intercept arrow keys | **Site navigation**, following the common ARIA APG pattern |

```tsx
// Framework routing preserves client navigation; list semantics preserves the link role.
<NavMenu
  semantics="list"
  items={[{ key: "/balance", label: "Balance details", render: <Link to="/balance" /> }]}
/>
// getByRole("link", { name: "Balance details" }) now succeeds.
```

The deciding question is whether the UI is a column of navigation links or an expandable tree. Site navigation is the former. Screen-reader users commonly list every link on the page; default tree semantics would hide every navigation row from that list and force tests to query `treeitem` instead.

## Usage guidelines

The default navigation accessibility label follows `ConfigProvider` (`"Sidebar navigation"` in `enUS`, Chinese in `zhCN`). An explicit `aria-label` still takes precedence.

- Put trailing controls in `actions`; the component positions them outside the tree-item button or link. **Do not put interactive elements such as `<button>` directly inside `label`**. That creates invalid nested controls and can cause hydration errors. Actions are available only in inline mode.
- Expansion uses a CSS `grid-template-rows` transition from `0fr` to `1fr`, avoiding JavaScript height measurement and preserving smooth nested expansion. See [[nested-collapsible-height-via-css-grid-rows-not-js-measure]].
- Use either controlled state (`selectedKeys` or `openKeys` plus callbacks) or uncontrolled initial state (`default*`) for each dimension, not both.
- Collapsed flyouts support unlimited cascading depth and keep the whole tree mounted. CSS `:hover` and `:focus-within` expose each level. In tree mode, keyboard navigation follows cascading-menu behavior: `→` enters a child level; `←` or `Esc` returns; `↑` and `↓` move only among siblings; and `Home` or `End` moves to the first or last item at the current level. Roving tabindex provides one tab stop for the whole tree, so do not expect Tab to visit every flyout entry. In `semantics="list"` mode, this keyboard contract yields entirely to native Tab order.
- **`semantics` changes the accessibility tree, not the appearance.** Both modes keep the same styling, indentation, selection state, and flyout behavior, so the wrong choice is invisible and produces no runtime error. Explicitly use `semantics="list"` for site navigation or screen-reader link lists will contain none of its destinations.
- The first collapsed flyout uses `position: fixed` with measured coordinates. This prevents a scrollable sidebar ancestor, including AdminLayout's ScrollArea, from clipping the panel. Deeper levels remain `absolute`. Coordinates update on captured `scroll` and `resize` events; a custom scroller that emits no scroll event can leave the panel misaligned.
- `openKeys` applies only to inline mode. Collapsed visibility follows hover and focus, does not enter `openKeys`, and does not call `onOpenChange`.
- Native menubar, SwiftUI, and Tauri menu caveats do not apply; this is a React WAI-ARIA tree.

## Related
[Navbar](../navbar/navbar.md) · [BeianFooter](../beian-footer/beian-footer.md) · [NavigationMenu](../navigation-menu/navigation-menu.md) · [Menu](../menu/menu.md) · [Menubar](../menubar/menubar.md) · [Dock](../dock/dock.md)
