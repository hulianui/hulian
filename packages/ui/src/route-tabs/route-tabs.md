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

> 路由页签条 · 中后台多标签工作区(右键关闭其他/左侧/右侧/全部/刷新 + 固定页签 + 拖拽调序 + 激活项滚入视口 + 溢出滚动) · 完全受控 · navigation/inpage

## 何时用

中后台「多标签工作区」那条页签栏 —— 打开的页面并排列着，可切、可关、可右键批量关。
[AdminLayout](../admin-layout/admin-layout.md) 内置了它；自己搭骨架时直接用本组件。

**它不是内容型 Tab。** 一屏之内切换内容用 [Tabs](../tabs/tabs.md)：那个管内容显隐，
这个管的是「打开了哪些页面」，内容由路由决定。

## 导入
```ts
import { RouteTabs } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| items* | `RouteTabItem[]` | — | 页签列表。**组件不持有它**，增删由你在回调里做 |
| activeKey | `string` | — | 当前激活页签 |
| actions | `RouteTabsAction[]` | 全部 | 右键菜单开放哪些动作 |
| extraMenuItems | `{ key, label, disabled? }[]` | — | 追加的自定义菜单项（排在内置动作之后） |
| sortable | `boolean` | `false` | 允许拖拽调序，须配 `onReorder` |
| disableAutoScroll | `boolean` | `false` | 关掉「激活页签自动滚入视口」 |
| className | `string` | — | — |

`RouteTabItem`

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| key * | `string` | — | 唯一键，也是 `activeKey` 的取值 |
| label * | `ReactNode` | — | 页签文案 |
| icon | `ReactNode` | — | 标签前的小图标 |
| closable | `boolean` | 见下 | 是否可关闭。默认规则：`pinned` 的恒不可关；其余在「可关闭页签数 > 1」时可关（关到只剩一个就停手，免得内容区空白） |
| pinned | `boolean` | `false` | 固定页签：恒不可关、排在最前，且不受「关闭其他 / 全部」影响 |

`RouteTabsMenuItem`（`extraMenuItems` 的元素）

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| key * | `string` | — | 菜单项键，回调里据此分辨 |
| label * | `ReactNode` | — | 菜单项文案 |
| disabled | `boolean` | `false` | 置灰不可点 |

`RouteTabsAction`：`"close" | "closeOthers" | "closeLeft" | "closeRight" | "closeAll" | "refresh"`。

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onChange | `(key: string) => void` | 切换激活页签 |
| onClose | `(key: string) => void` | 关闭单个（点 × 或右键「关闭」） |
| onAction | `(action, tabKey, affectedKeys) => void` | 批量动作。第三参是**该动作实际影响到的 key 列表**（已排除 pinned 与不可关的） |
| onExtraAction | `(menuKey, tabKey) => void` | 自定义菜单项被点击 |
| onReorder | `(keys: string[]) => void` | 拖拽调序后的完整 key 顺序（pinned 恒在前） |

另导出一组纯函数，让受控消费方与组件用**同一份口径**算，不各算各的：

```ts
import { affectedKeys, nextActiveKey, isClosable, orderTabs, reorderTabs } from "@hulianui/ui"

affectedKeys("closeAll", "b", items)   // 该动作会关掉哪些 key
nextActiveKey(items, closing, active)  // 关完之后激活页该落到哪
```

## 示例
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
    if (action === "refresh") return remountPage(key)   // keep-alive 各家实现不同
    closeKeys(affected)
  }}
/>
```

## 禁忌 / 坑

- **它是完全受控的**：不接 `onAction`，右键菜单里的「关闭其他/左侧/右侧/全部」点了不会有任何变化
  —— 组件不持有 `items`，改不了。这正是从 AdminLayout 里抽出来的原因：内置那版在受控模式下
  只调了 `setActive` 没有对外回调，点了看着毫无反应。
- **`closeAll` 关的是全部可关页签（含当前页），不是「关闭其他」**。两者是不同的动作，
  别把菜单文案和行为对错。
- **`refresh` 不改 `items`**，只把「请重新挂载这一页」的意图传出去。keep-alive 的实现各家不同
  （换 remount key / 清缓存 / 重新请求），组件不替你决定，`affectedKeys` 恒为空数组。
- `closeLeft` / `closeRight` 按**展示顺序**算，不是数据顺序 —— `pinned` 会被提到最前，从而改变左右关系。
- 拖拽调序时**固定段与普通段不互相拖入**：`pinned` 的语义就是「钉在最前」，允许混排会让它自相矛盾。
- 溢出时才出左右滚动按钮（靠 `ResizeObserver` 量）。jsdom 里没有 RO，测试中按钮不出现是正常的。

## 相关
[AdminLayout](../admin-layout/admin-layout.md) · [Tabs](../tabs/tabs.md) · [ContextMenu](../context-menu/context-menu.md) · [NavMenu](../nav-menu/nav-menu.md) · [Breadcrumb](../breadcrumb/breadcrumb.md) · [Layout](../layout/layout.md)
