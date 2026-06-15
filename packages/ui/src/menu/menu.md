---
slug: menu
name: Menu
category: navigation
group: global
tags: []
exports: [Menu, MenuTrigger, MenuContent, MenuItem, MenuSeparator, MenuGroup, MenuGroupLabel, menuItemVariants]
status: enriched
---

# Menu

> 下拉菜单 · Base UI 命令式 + Item/分隔/分组 + danger · navigation/global

## 何时用

点击触发器弹出的一组操作项（编辑/复制/删除等），适合表格行操作、卡片更多按钮、头像账号菜单。需要 hover 展开的 mega 站点导航用 [NavigationMenu](../navigation-menu/navigation-menu.md)；多个顶层菜单横排成 File/Edit/View 菜单条用 [Menubar](../menubar/menubar.md)。

## 导入
```ts
import { Menu, MenuTrigger, MenuContent, MenuItem, MenuSeparator, MenuGroup, MenuGroupLabel, menuItemVariants } from "@hulianui/ui"
```

## Props

### MenuContent
| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| side | `"top" \| "right" \| "bottom" \| "left"` | `"bottom"` | 弹出方位 |
| align | `"start" \| "center" \| "end"` | `"start"` | 沿触发器的对齐 |
| sideOffset | `number` | — | 与触发器的间距(px) |
| className | `string` | — | — |

### MenuItem
| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| disabled | `boolean` | `false` | 禁用 |
| closeOnClick | `boolean` | `true` | 点击后是否关闭菜单 |
| label | `string` | — | 键盘 type-ahead 的文案覆盖 |
| variant | `"default" \| "danger"` | `"default"` | danger 为危险操作（红色） |
| className | `string` | — | — |

`MenuTrigger` 用 `render={<Button />}` 把任意元素作触发器。

## Events

### MenuItem
| 事件 | 类型 | 说明 |
|------|------|------|
| onClick | `MouseEventHandler<HTMLElement>` | 点击回调 |

## Slots

### MenuContent
| 插槽 | 类型 | 说明 |
|------|------|------|
| children* | `ReactNode` | 菜单项 |

### MenuItem
| 插槽 | 类型 | 说明 |
|------|------|------|
| children | `ReactNode` | 项内容 |

## 示例
```tsx
<Menu>
  <MenuTrigger render={<Button>菜单</Button>} />
  <MenuContent side="bottom" align="start">
    <MenuItem>编辑</MenuItem>
    <MenuItem disabled>归档（禁用）</MenuItem>
    <MenuSeparator />
    <MenuItem variant="danger">删除</MenuItem>
  </MenuContent>
</Menu>
```

含分组（`MenuGroupLabel` 必须裹在 `MenuGroup` 内）：
```tsx
<MenuContent>
  <MenuGroup>
    <MenuGroupLabel>操作</MenuGroupLabel>
    <MenuItem>编辑</MenuItem>
    <MenuItem>复制</MenuItem>
  </MenuGroup>
</MenuContent>
```

## 禁忌 / 坑

- [[base-ui-menu-group-label-requires-menu-group-wrapper]]：`MenuGroupLabel` 直接放进 `MenuContent`（不裹 `MenuGroup`）会在「点开菜单」那一刻抛 `MenuGroupRootContext is missing`，触发器渲染正常但点击崩页 —— 分组标签必须包在 `MenuGroup` 里。

## 相关
[Navbar](../navbar/navbar.md) · [BeianFooter](../beian-footer/beian-footer.md) · [NavMenu](../nav-menu/nav-menu.md) · [NavigationMenu](../navigation-menu/navigation-menu.md) · [Menubar](../menubar/menubar.md) · [Dock](../dock/dock.md)
