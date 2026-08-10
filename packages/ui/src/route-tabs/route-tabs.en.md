---
slug: route-tabs
name: RouteTabs
category: navigation
group: inpage
tags: []
exports: [RouteTabs, affectedKeys, isClosable, nextActiveKey, orderTabs, reorderTabs]
status: enriched
---

# RouteTabs

> Route workspace tabs · controlled admin-page tabs with close-other/left/right/all, refresh, pinned tabs, drag reordering, active-item scrolling, and overflow controls · navigation/inpage

## When to use

Use RouteTabs for the tab strip of a multi-page admin workspace: opened routes remain side by side and can be activated, closed, reordered, or batch-closed. [AdminLayout](../admin-layout/admin-layout.md) includes it; use this component when assembling your own shell.

It is not a content tab. Use [Tabs](../tabs/tabs.md) to switch content within one page. RouteTabs tracks opened pages while routing determines the content.

## Import
```ts
import { RouteTabs } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| items* | `RouteTabItem[]` | — | Controlled tab list. The component never mutates it. |
| activeKey | `string` | — | Active tab key. |
| actions | `RouteTabsAction[]` | All | Built-in context-menu actions to expose. |
| extraMenuItems | `{ key, label, disabled? }[]` | — | Custom entries appended after built-in actions. |
| sortable | `boolean` | `false` | Enables drag reordering; pair with `onReorder`. |
| disableAutoScroll | `boolean` | `false` | Disables scrolling the active tab into view. |
| className | `string` | — | Root class name. |

`RouteTabItem`

| Name | Type | Default | Description |
|------|------|------|------|
| key * | `string` | — | Unique key, also the value used by `activeKey`. |
| label * | `ReactNode` | — | Tab text. |
| icon | `ReactNode` | — | Small icon before the label. |
| closable | `boolean` | See description | Whether the tab can be closed. By default pinned tabs are never closable, and other tabs stay closable only while more than one closable tab exists (closing down to one stops, so the content area never goes blank). |
| pinned | `boolean` | `false` | Pinned tab: never closable, sorted first, and unaffected by "close others" or "close all". |

`RouteTabsMenuItem` (entries of `extraMenuItems`)

| Name | Type | Default | Description |
|------|------|------|------|
| key * | `string` | — | Menu-item key used to tell entries apart in the callback. |
| label * | `ReactNode` | — | Menu-item text. |
| disabled | `boolean` | `false` | Greyed out and not clickable. |

`RouteTabsAction` is `"close" | "closeOthers" | "closeLeft" | "closeRight" | "closeAll" | "refresh"`.

## Events

| Event | Type | Description |
|------|------|------|
| onChange | `(key: string) => void` | Requests a new active tab. |
| onClose | `(key: string) => void` | Requests closing one tab from its button or menu. |
| onAction | `(action, tabKey, affectedKeys) => void` | Reports a batch action and the actual affected keys after pinned and non-closable exclusions. |
| onExtraAction | `(menuKey, tabKey) => void` | Reports a custom menu action. |
| onReorder | `(keys: string[]) => void` | Reports the complete reordered key list, with pinned tabs first. |

Pure helpers let the controlled consumer apply exactly the component's rules:

```ts
import { affectedKeys, nextActiveKey, isClosable, orderTabs, reorderTabs } from "@hulianui/ui"

affectedKeys("closeAll", "b", items)
nextActiveKey(items, closing, active)
```

## Example
```tsx
const [items, setItems] = useState(INITIAL)
const [active, setActive] = useState("orders")

const closeKeys = (keys: string[]) => {
  setActive((cur) => nextActiveKey(items, keys, cur) ?? cur)
  setItems((prev) => prev.filter((t) => !keys.includes(t.key)))
}

<RouteTabs
  items={items}
  activeKey={active}
  onChange={setActive}
  onClose={(k) => closeKeys([k])}
  onAction={(action, key, affected) => {
    if (action === "refresh") return remountPage(key)
    closeKeys(affected)
  }}
/>
```

## Usage notes

- RouteTabs is fully controlled. Without `onAction`, batch close menu actions cannot change `items`.
- `closeAll` includes the current tab among all closable tabs; pinned tabs remain.
- Refresh never changes `items`; handle the intent with a remount key, cache invalidation, or new request. `affectedKeys` is empty for refresh.
- Left and right use display order after pinned tabs are moved to the front.
- Pinned and regular segments cannot be dragged across each other.
- Overflow controls depend on `ResizeObserver`; their absence in jsdom is expected.

## Related
[AdminLayout](../admin-layout/admin-layout.md) · [Tabs](../tabs/tabs.md) · [ContextMenu](../context-menu/context-menu.md) · [NavMenu](../nav-menu/nav-menu.md) · [Breadcrumb](../breadcrumb/breadcrumb.md) · [Layout](../layout/layout.md)
