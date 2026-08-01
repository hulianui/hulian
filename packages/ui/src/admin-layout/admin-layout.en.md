---
slug: admin-layout
name: AdminLayout
category: layout
group: container
tags: []
exports: [AdminLayout]
status: enriched
---

# AdminLayout

> Admin application shell · Collapsible branded sidebar with NavMenu + header with collapse control, breadcrumbs, and actions + multi-tab navigation with controlled routing or automatic menu-driven state + content area built from NavMenu, ScrollArea, and Popover · layout/container

## When to use

Use AdminLayout when you need a complete admin shell with a sidebar menu, header, and multi-tab keep-alive navigation out of the box. Provide `menuItems` and `children` to get started. If you need full control over each region, no built-in tab behavior, or a more composable foundation, use [Layout](../layout/layout.md) instead.

## Import
```ts
import { AdminLayout } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| menuItems* | `NavMenuNode[]` | — | Sidebar menu data rendered with NavMenu. |
| selectedKey | `string` | — | Controlled selected menu item key. |
| defaultSelectedKey | `string` | — | Initial selected menu item key when uncontrolled. |
| openKeys | `string[]` | — | Controlled keys for expanded submenus. |
| defaultOpenKeys | `string[]` | — | Initial expanded submenu keys when uncontrolled. |
| collapsed | `boolean` | — | Controlled sidebar collapse state. |
| defaultCollapsed | `boolean` | `false` | Initial sidebar collapse state when uncontrolled. |
| breakpoint | `"sm"｜"md"｜"lg"｜"xl"｜"2xl"｜number` | — | Responsive breakpoint with the same semantics as LayoutSider. The sidebar collapses when the viewport is at or below this width and expands above it. In uncontrolled mode, the component updates its own state. When `collapsed` is passed, it only calls `onCollapsedChange`; the consumer decides whether to apply the new state. Omit this prop to disable automatic collapsing. |
| showTabs | `boolean` | `true` | Whether to show the tab bar. |
| tabs | `AdminTab[]` | — | Controlled tab list. When omitted, menu selections maintain the list automatically. |
| activeKey | `string` | — | Controlled active tab key. |
| defaultActiveKey | `string` | — | Initial active tab key when uncontrolled; it also determines which tab opens on first render. |
| fitViewport | `boolean` | `true` | Whether the shell fills the viewport. Keep `true` for a full-page application: the shell uses a fixed 100dvh height and scrolls inside the content area. Pass `false` inside a fixed-height preview or container and use `h-full` to follow the parent height. |
| className | `string` | — | Additional class name for the root container. |
| contentClassName | `string` | — | Additional class name for the content area. |

`AdminTab` has the shape `{ key: string; label: ReactNode; closable?: boolean }`. By default, `closable` allows a tab to close when more than one tab is open; the final tab cannot be closed.

The tab bar is the standalone [RouteTabs](../route-tabs/route-tabs.md) component. RouteTabs provides the context menu, pinned tabs, drag-and-drop ordering, and automatic scrolling of the active tab into view; AdminLayout simply embeds it in the shell. Use RouteTabs directly when composing your own shell.

## Events

| Event | Type | Description |
|------|------|------|
| onMenuSelect | `(key: string, item: NavMenuItem) => void` | Called when a leaf menu item is selected. |
| onOpenChange | `(openKeys: string[]) => void` | Called when the expanded submenu keys change. |
| onCollapsedChange | `(collapsed: boolean) => void` | Called when the sidebar collapse state changes. |
| onTabChange | `(key: string) => void` | Called when the active tab changes. |
| onTabClose | `(key: string) => void` | Called when a tab is closed. |
| onTabsAction | `(action, tabKey, affectedKeys) => void` | Called for context-menu actions such as close others, close left/right/all, or refresh. The third argument contains the keys actually affected by the action. ⚠️ **This is the only update path when `tabs` is controlled**: without this handler, these actions cannot change the consumer-owned tab list. |

## Slots

| Slot | Type | Description |
|------|------|------|
| children | `ReactNode` | Main content for the active page, selected by the application from `activeKey`. |
| logo | `ReactNode` | Brand area (expanded). |
| logoCollapsed | `ReactNode` | Brand area (collapsed, logo reused by default). |
| breadcrumb | `ReactNode` | Top bar breadcrumb area. |
| headerExtra | `ReactNode` | Extension area on the right side of the top bar (user menu/notification/theme switching, etc.). |

## Example
```tsx
const [active, setActive] = useState("dashboard");

<AdminLayout
  menuItems={menu}
  logo={<span className="font-bold text-primary">HulianUI Admin</span>}
  logoCollapsed={<span className="font-bold text-primary">H</span>}
  breakpoint="md" // Collapse the sidebar automatically at ≤768px
  defaultActiveKey="dashboard"
  defaultSelectedKey="dashboard"
  defaultOpenKeys={["users"]}
  onTabChange={setActive}
  breadcrumb={<span className="text-sm text-muted">Home / {active}</span>}
  headerExtra={<Avatar fallback="H" />}
>
  <Page k={active} />
</AdminLayout>
```

## Usage guidelines

- **Handle `onTabsAction` when `tabs` is controlled.** AdminLayout does not own the `tabs` array in controlled mode. Context-menu actions can only report the keys that should change; the consumer must apply the update.
- **Close All closes every closeable tab, including the active tab.** It is distinct from Close Others.
- **Choose the height strategy with `fitViewport`.** Keep the default `true` for a full-page shell and do not add another `h-dvh` wrapper. Pass `false` when embedding AdminLayout in a fixed-height container such as a documentation preview, or the page will scroll instead of the content area. See [[hulian-adminlayout-fitviewport]].
- **Choose either controlled or uncontrolled tabs.** Omit `tabs` to let menu selections maintain the tab list. Once `tabs` is passed, handle `onTabChange` and `onTabClose` and keep the array and `activeKey` in application state.
- `children` renders only the active page. The application must manage any keep-alive cache keyed by `activeKey`; AdminLayout does not cache each page's DOM.
- **Set `breakpoint` for mobile layouts** (`"md"` is recommended). Without it, the sidebar remains expanded and occupies more than half of a 390px viewport. The prop has no default to preserve existing behavior, so responsive collapsing must be enabled explicitly.

## Related
[Layout](../layout/layout.md) · [ScrollArea](../scroll-area/scroll-area.md) · [Viewport](../viewport/viewport.md) · [Resizable](../resizable/resizable.md) · [AspectRatio](../aspect-ratio/aspect-ratio.md) · [FitScreen](../fit-screen/fit-screen.md)
