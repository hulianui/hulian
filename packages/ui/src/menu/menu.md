---
slug: menu
name: Menu
category: navigation
group: global
tags: []
exports: [Menu, MenuTrigger, MenuContent, MenuItem, MenuCheckboxItem, MenuRadioGroup, MenuRadioItem, MenuSeparator, MenuGroup, MenuGroupLabel, MenuSub, MenuSubTrigger, MenuSubContent, menuItemVariants]
status: enriched
---

# Menu

> 下拉菜单 · Base UI 命令式 + Item/分隔/分组 + danger · navigation/global

## 何时用

点击触发器弹出的一组操作项（编辑/复制/删除等），适合表格行操作、卡片更多按钮、头像账号菜单。选项多到一级面板放不下时用 `MenuSub` 分层收纳。需要 hover 展开的 mega 站点导航用 [NavigationMenu](../navigation-menu/navigation-menu.md)；多个顶层菜单横排成 File/Edit/View 菜单条用 [Menubar](../menubar/menubar.md)。

## 导入
```ts
import { Menu, MenuTrigger, MenuContent, MenuItem, MenuCheckboxItem, MenuRadioGroup, MenuRadioItem, MenuSeparator, MenuGroup, MenuGroupLabel, MenuSub, MenuSubTrigger, MenuSubContent, menuItemVariants } from "@hulianui/ui"
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

### MenuCheckboxItem
可开关的设置项，渲染 `role="menuitemcheckbox"` + `aria-checked`。

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| checked | `boolean` | — | 是否勾选（受控）。要非受控请改用 `defaultChecked` |
| defaultChecked | `boolean` | `false` | 初始是否勾选（非受控） |
| disabled | `boolean` | `false` | 禁用 |
| closeOnClick | `boolean` | `false` | 点击后是否关闭菜单。勾选项默认**不关**，便于连续勾选 |
| label | `string` | — | 键盘 type-ahead 的文案覆盖 |
| variant | `"default" \| "danger"` | `"default"` | danger 为危险操作（红色） |
| className | `string` | — | — |

### MenuRadioGroup
一组互斥选项的容器；互斥关系由它维护，`MenuRadioItem` 必须放在它内部。

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| value | `string` | — | 当前选中项的值（受控）。要非受控请改用 `defaultValue` |
| defaultValue | `string` | — | 初始选中项的值（非受控） |
| disabled | `boolean` | `false` | 整组禁用 |
| className | `string` | — | — |

### MenuRadioItem
互斥选项中的一项，渲染 `role="menuitemradio"` + `aria-checked`。

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| value* | `string` | — | 本项的值；与所在 `MenuRadioGroup` 的 value 相等即为选中态 |
| disabled | `boolean` | `false` | 禁用 |
| closeOnClick | `boolean` | `false` | 点击后是否关闭菜单。单选项默认**不关**，选完想收起菜单要显式传 `true` |
| label | `string` | — | 键盘 type-ahead 的文案覆盖 |
| variant | `"default" \| "danger"` | `"default"` | danger 为危险操作（红色） |
| className | `string` | — | — |

### MenuSubTrigger
展开级联子菜单的菜单项，右侧带 chevron。必须与 `MenuSubContent` 一起放在 `MenuSub` 内。

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| disabled | `boolean` | `false` | 禁用（不可展开子菜单） |
| label | `string` | — | 键盘 type-ahead 的文案覆盖 |
| variant | `"default" \| "danger"` | `"default"` | danger 为危险操作（红色） |
| className | `string` | — | — |

没有 `closeOnClick`：它的点击语义是「展开下一级」而不是「执行动作」。

### MenuSubContent
子菜单面板，从父项右侧展开。方位固定（`side="right"` / `align="start"`），不开放 `side` / `align` / `sideOffset` —— 越界时由 Base UI 自动翻边。

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| className | `string` | — | — |

`MenuTrigger` 用 `render={<Button />}` 把任意元素作触发器。`MenuSub` 是纯结构件，只负责把 `MenuSubTrigger` 与 `MenuSubContent` 绑成一级。

## Events

### MenuItem
| 事件 | 类型 | 说明 |
|------|------|------|
| onClick | `MouseEventHandler<HTMLElement>` | 点击回调 |

### MenuCheckboxItem
| 事件 | 类型 | 说明 |
|------|------|------|
| onCheckedChange | `(checked: boolean) => void` | 勾选态变化回调 |
| onClick | `MouseEventHandler<HTMLElement>` | 点击回调 |

### MenuRadioGroup
| 事件 | 类型 | 说明 |
|------|------|------|
| onValueChange | `(value: string) => void` | 选中值变化回调 |

### MenuRadioItem
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

### MenuCheckboxItem / MenuRadioItem
| 插槽 | 类型 | 说明 |
|------|------|------|
| children | `ReactNode` | 项内容；渲染在选中标记右侧的第二列 |

### MenuRadioGroup
| 插槽 | 类型 | 说明 |
|------|------|------|
| children | `ReactNode` | 一组 `MenuRadioItem` |

### MenuSubTrigger
| 插槽 | 类型 | 说明 |
|------|------|------|
| children | `ReactNode` | 项内容；chevron 由组件补在右侧，不用自己画 |

### MenuSub / MenuSubContent
| 插槽 | 类型 | 说明 |
|------|------|------|
| children* | `ReactNode` | `MenuSub` 放一个 `MenuSubTrigger` + 一个 `MenuSubContent`；`MenuSubContent` 放子菜单项 |

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

勾选项与单选项（当前值打勾）：
```tsx
<MenuContent>
  <MenuGroup>
    <MenuGroupLabel>显示</MenuGroupLabel>
    <MenuCheckboxItem defaultChecked>显示网格</MenuCheckboxItem>
    <MenuCheckboxItem>显示标尺</MenuCheckboxItem>
  </MenuGroup>
  <MenuSeparator />
  <MenuGroup>
    <MenuGroupLabel>优先级</MenuGroupLabel>
    <MenuRadioGroup value={priority} onValueChange={setPriority}>
      <MenuRadioItem value="low" closeOnClick>低</MenuRadioItem>
      <MenuRadioItem value="medium" closeOnClick>中</MenuRadioItem>
      <MenuRadioItem value="high" closeOnClick>高</MenuRadioItem>
    </MenuRadioGroup>
  </MenuGroup>
</MenuContent>
```
（这里的 `closeOnClick` 是「选完即收起菜单」的写法；默认值是 `false`，不传就停在菜单里继续改。）

级联子菜单（选项按维度分层，适合总数几十个的筛选菜单）：
```tsx
<MenuContent>
  <MenuItem>全部任务</MenuItem>
  <MenuSeparator />
  <MenuSub>
    <MenuSubTrigger>状态</MenuSubTrigger>
    <MenuSubContent>
      <MenuItem>待办</MenuItem>
      <MenuItem>进行中</MenuItem>
      <MenuItem>已完成</MenuItem>
    </MenuSubContent>
  </MenuSub>
</MenuContent>
```
`MenuSub` 可以嵌套多层：把下一个 `MenuSub` 放进 `MenuSubContent` 即可。

## 禁忌 / 坑

- **一组选项别用 `MenuItem` + 自己画一个 √**。视觉上与 `MenuCheckboxItem` / `MenuRadioItem` 完全一样，所以这个错误看不出来：但元素 role 退化成 `menuitem`、没有 `aria-checked`，读屏用户听到的是几个平级动作，听不出这是一组互斥选项、也听不出当前选的是哪个，键盘用户的选中态只剩视觉。可开关的设置用 `MenuCheckboxItem`，互斥选项用 `MenuRadioGroup` + `MenuRadioItem`。
- `MenuRadioItem` 必须放在 `MenuRadioGroup` 内 —— 互斥关系与选中值由组维护，单独放在 `MenuContent` 里不会有选中态。
- 勾选标记占的是与 `MenuItem` 首个 `size-4` 图标同宽的第一列，所以同一个菜单里混用普通项与勾选项时文字左缘是齐的；给普通项配图标时同样用 `size-4`，别改成别的尺寸。
- [[base-ui-menu-group-label-requires-menu-group-wrapper]]：`MenuGroupLabel` 直接放进 `MenuContent`（不裹 `MenuGroup`）会在「点开菜单」那一刻抛 `MenuGroupRootContext is missing`，触发器渲染正常但点击崩页 —— 分组标签必须包在 `MenuGroup` 里。
- `MenuSubTrigger` 与 `MenuSubContent` 必须同在一个 `MenuSub` 内，且 `MenuSub` 必须在 `MenuContent` 里。用 `MenuItem` 加一个自己画的箭头替代 `MenuSubTrigger` 是看不出问题的错误：视觉一样，但没有 `aria-haspopup` / `aria-expanded`，读屏用户听不出这一项还有下一级。
- 别拿 `MenuContent side="right"` 当子面板用。它在 `MenuSub` 里确实能渲染成子菜单（内部是同一套 Portal/Positioner/Popup），但 chevron、`sideOffset`、展开时父项保持高亮这三样都要自己补，漏一样就与库内其它子菜单不一致 —— `MenuSubContent` 就是把这三样固化下来的那一层。
- 菜单默认带 `max-h-[min(24rem,var(--available-height))] overflow-y-auto`：放得下时不产生任何视觉差异，项数一多就改为内部滚动。这是库内兜底而不是「每个消费方自己记得加」——浮层是 fixed 的，溢出视口那截既点不到、页面也滚不出来，而且只有等数据长起来才暴露（开发时 3 项、上线后 40 项）。要更矮/更高就在 `className` 上覆盖 `max-h-*`。`ContextMenu` 同款。

## 相关
[Navbar](../navbar/navbar.md) · [BeianFooter](../beian-footer/beian-footer.md) · [NavMenu](../nav-menu/nav-menu.md) · [NavigationMenu](../navigation-menu/navigation-menu.md) · [Menubar](../menubar/menubar.md) · [Dock](../dock/dock.md)
