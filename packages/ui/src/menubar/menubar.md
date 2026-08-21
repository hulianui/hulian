---
slug: menubar
name: Menubar
category: navigation
group: global
tags: []
exports: [Menubar, MenubarMenu, MenubarTrigger, MenubarContent, MenubarItem, MenubarSeparator, MenubarGroup, MenubarGroupLabel]
status: enriched
---

# Menubar

> 把常驻的应用菜单排成一条键盘可达的菜单栏 · navigation/global

## 何时用

桌面应用式的水平菜单条：多个顶层入口（文件/编辑/视图）各带下拉，方向键可在顶层间漫游、相邻菜单自动接力展开。只有单个触发器弹一组操作用 [Menu](../menu/menu.md)；站点主导航 mega 面板用 [NavigationMenu](../navigation-menu/navigation-menu.md)。

## 导入
```ts
import { Menubar, MenubarMenu, MenubarTrigger, MenubarContent, MenubarItem, MenubarSeparator, MenubarGroup, MenubarGroupLabel } from "@hulianui/ui"
```

## Props

根 `Menubar` 透传 Base UI `Menubar`，叠加 `className`；`MenubarMenu`/`MenubarTrigger` 透传 Base UI Menu 对应部件。下拉项部件（Item/Separator/Group/GroupLabel）复用 [Menu](../menu/menu.md) 皮肤，用法一致（如 `MenubarItem` 支持 `variant="danger"`）。

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| modal | `boolean` | `true` | 模态（打开时背景不可交互） |
| orientation | `"horizontal" \| "vertical"` | `"horizontal"` | 菜单条方向 |
| loopFocus | `boolean` | `true` | 方向键漫游到末项后回环 |
| disabled | `boolean` | `false` | 禁用整条 |
| className | `string` | - | - |

`MenubarMenu` 透传 Base UI Menu.Root（`open`/`defaultOpen`/`onOpenChange` 等）；`MenubarTrigger` 透传 Menu.Trigger。

## Events

### MenubarMenu
| 事件 | 类型 | 说明 |
|------|------|------|
| onOpenChange | `(open: boolean) => void` | 顶层菜单展开/收起回调（透传 Base UI `Menu.Root`） |

## 示例
```tsx
<Menubar>
  <MenubarMenu>
    <MenubarTrigger>文件</MenubarTrigger>
    <MenubarContent>
      <MenubarItem>新建窗口</MenubarItem>
      <MenubarSeparator />
      <MenubarItem variant="danger">退出</MenubarItem>
    </MenubarContent>
  </MenubarMenu>
  {/* 更多顶层菜单… */}
</Menubar>
```

## 禁忌 / 坑

- 同 [Menu](../menu/menu.md)：`MenubarGroupLabel` 须裹在 `MenubarGroup` 内，否则打开菜单时抛缺 GroupRootContext。
- 顶层只放 `MenubarTrigger` + `MenubarContent`，菜单项放在 Content 内，别把 `MenubarItem` 直接挂到 `Menubar` 上。

## 相关
[Navbar](../navbar/navbar.md) · [BeianFooter](../beian-footer/beian-footer.md) · [NavMenu](../nav-menu/nav-menu.md) · [NavigationMenu](../navigation-menu/navigation-menu.md) · [Menu](../menu/menu.md) · [Dock](../dock/dock.md)
