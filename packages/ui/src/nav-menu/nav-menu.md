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

> 侧边导航菜单 · 自研零依赖 · inline 手风琴/collapsed 图标飞出 + 树形 items + 选中/展开受控 + 纯 CSS grid 高度过渡 + WAI-ARIA tree 键盘漫游 · navigation/global

## 何时用

中后台左侧 Sider 树形导航（多级菜单、可收起、可受控选中/展开）用，数据驱动 `items`，支持 inline 手风琴与 collapsed 图标飞出两种形态，还能给每行挂行尾操作（如会话列表的删除）。横向顶栏用 [Navbar](../navbar/navbar.md)，带下拉面板的导航用 [NavigationMenu](../navigation-menu/navigation-menu.md)，右键/上下文菜单用 [Menu](../menu/menu.md)。

## 导入
```ts
import { NavMenu } from "@hulianui/ui"
```

## Props

`items` 元素为 `NavMenuNode = NavMenuItem | NavMenuGroup`。`NavMenuItem` = `{ key; label; icon?; href?; disabled?; actions?; children? }`（有 `children` 即可展开父项，有 `href` 渲染 `<a>` 否则 `<button>`）；`NavMenuGroup` = `{ type:"group"; key; label; children }`（不可折叠小标题，key 不进选中/展开态）。继承 `<nav>` 原生属性（`onSelect` 除外）。

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| items* | `NavMenuNode[]` | — | 树形菜单数据 |
| mode | `"inline" \| "collapsed"` | `"inline"` | inline=手风琴内联展开；collapsed=Sider 收起态图标 + 悬浮飞出子菜单 |
| selectedKeys | `string[]` | — | 选中态（受控） |
| defaultSelectedKeys | `string[]` | — | 选中态（非受控初值） |
| openKeys | `string[]` | — | 展开态（受控） |
| defaultOpenKeys | `string[]` | — | 展开态（非受控初值） |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onSelect | `(key: string, item: NavMenuItem) => void` | 点击叶子项触发 |
| onOpenChange | `(openKeys: string[]) => void` | 展开态变化回调 |

## 示例
```tsx
// 受控选中 + 行尾删除（actions 槽用 group-hover/nav-row 钩子做 hover 才显）
function ConvoNav() {
  const [sel, setSel] = useState<string[]>(["c1"]);
  return (
    <NavMenu
      items={[
        {
          type: "group",
          key: "today",
          label: "今天",
          children: [
            { key: "c1", label: "瑚琏组件库怎么接入", actions: <DeleteAction /> },
            { key: "c2", label: "帮我润色一封周报", actions: <DeleteAction /> },
          ],
        },
      ]}
      selectedKeys={sel}
      onSelect={(k) => setSel([k])}
    />
  );
}
```

## 禁忌 / 坑

- 行尾操作放 `actions` 槽，组件会渲在 treeitem 按钮/链接【之外】（绝对覆盖行右侧）。**别把 `<button>` 等交互元素直接塞进 `label`**——嵌进 treeitem 按钮是非法 HTML，会触发 hydration 报错。`actions` 仅 inline 态生效。
- 高度过渡用纯 CSS `grid-template-rows` 0fr→1fr，不靠 JS 测高，嵌套展开也不抖。参见 [[nested-collapsible-height-via-css-grid-rows-not-js-measure]]。
- 选中/展开态可受控（`selectedKeys`/`openKeys` + 回调）或非受控（`default*`），勿混用同一维度。
- SCAFFOLD 列的 menubar/SwiftUI/Tauri 原生菜单类坑均不适用本组件（它是纯 React WAI-ARIA tree，非系统托盘菜单）。

## 相关
[Navbar](../navbar/navbar.md) · [BeianFooter](../beian-footer/beian-footer.md) · [NavigationMenu](../navigation-menu/navigation-menu.md) · [Menu](../menu/menu.md) · [Menubar](../menubar/menubar.md) · [Dock](../dock/dock.md)
