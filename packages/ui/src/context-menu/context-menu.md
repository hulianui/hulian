---
slug: context-menu
name: ContextMenu
category: navigation
group: action
tags: []
exports: [ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem, ContextMenuCheckboxItem, ContextMenuRadioGroup, ContextMenuRadioItem, ContextMenuSeparator, ContextMenuGroup, ContextMenuGroupLabel, ContextMenuSub, ContextMenuSubTrigger, ContextMenuSubContent]
status: enriched
---

# ContextMenu

> 在右键落点弹出上下文操作菜单，可标危险项 · navigation/action

## 何时用

在某区域右键（或长按）弹出锚到光标的上下文菜单：编辑/复制/删除、级联子菜单、分组。需要全局搜索式命令入口用 [Command](../command/command.md)；需要常驻可见按钮排用 [Toolbar](../toolbar/toolbar.md)；ContextMenu 是绑定到目标区域、按需弹出的动作清单。复用 Menu 皮肤，支持 `variant="danger"` 危险项。

## 导入
```ts
import { ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem, ContextMenuCheckboxItem, ContextMenuRadioGroup, ContextMenuRadioItem, ContextMenuSeparator, ContextMenuGroup, ContextMenuGroupLabel, ContextMenuSub, ContextMenuSubTrigger, ContextMenuSubContent } from "@hulianui/ui"
```

## Props

**ContextMenuItem**

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| disabled | `boolean` | - | - |
| closeOnClick | `boolean` | `true` | 点击后是否关闭菜单。 |
| label | `string` | - | 键盘 type-ahead 用文案覆盖（children 非纯文本时补）。 |
| variant | `"default" \| "danger"` | `"default"` | danger 用危险色（删除等）。 |
| className | `string` | - | - |

**ContextMenuCheckboxItem** —— 可开关的设置项，渲染 `role="menuitemcheckbox"` + `aria-checked`。

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| checked | `boolean` | - | 是否勾选（受控）。要非受控请改用 `defaultChecked` |
| defaultChecked | `boolean` | `false` | 初始是否勾选（非受控） |
| disabled | `boolean` | `false` | 禁用 |
| closeOnClick | `boolean` | `false` | 点击后是否关闭菜单。勾选项默认**不关**，便于连续勾选 |
| label | `string` | - | 键盘 type-ahead 用文案覆盖 |
| variant | `"default" \| "danger"` | `"default"` | danger 用危险色 |
| className | `string` | - | - |

**ContextMenuRadioGroup** —— 一组互斥选项的容器；`ContextMenuRadioItem` 必须放在它内部。

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| value | `string` | - | 当前选中项的值（受控）。要非受控请改用 `defaultValue` |
| defaultValue | `string` | - | 初始选中项的值（非受控） |
| disabled | `boolean` | `false` | 整组禁用 |
| className | `string` | - | - |

**ContextMenuRadioItem** —— 互斥选项中的一项，渲染 `role="menuitemradio"` + `aria-checked`。

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| value* | `string` | - | 本项的值；与所在 `ContextMenuRadioGroup` 的 value 相等即为选中态 |
| disabled | `boolean` | `false` | 禁用 |
| closeOnClick | `boolean` | `false` | 点击后是否关闭菜单。单选项默认**不关**，选完想收起菜单要显式传 `true` |
| label | `string` | - | 键盘 type-ahead 用文案覆盖 |
| variant | `"default" \| "danger"` | `"default"` | danger 用危险色 |
| className | `string` | - | - |

**ContextMenuSubTrigger**：Props `disabled` / `label` / `variant?: "default" \| "danger"` / `className`；Slots `children`。
**ContextMenuContent / ContextMenuSubContent**：Props `className`；Slots `children`。
**ContextMenuTrigger / Group / GroupLabel / Separator / Sub**：结构性组件（薄包 Base UI 原语，透传 children / className）。

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onClick | `MouseEventHandler<HTMLElement>` | `ContextMenuItem` / `ContextMenuCheckboxItem` / `ContextMenuRadioItem` 点击回调。 |
| onCheckedChange | `(checked: boolean) => void` | `ContextMenuCheckboxItem` 勾选态变化回调。 |
| onValueChange | `(value: string) => void` | `ContextMenuRadioGroup` 选中值变化回调。 |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| children | `ReactNode` | `ContextMenuItem` 菜单项内容；`ContextMenuCheckboxItem` / `ContextMenuRadioItem` 渲染在选中标记右侧的第二列；`ContextMenuRadioGroup` 放一组 `ContextMenuRadioItem`。 |

## 示例
```tsx
<ContextMenu>
  <ContextMenuTrigger className="flex h-28 items-center justify-center border border-dashed">
    右键点击此区域
  </ContextMenuTrigger>
  <ContextMenuContent>
    <ContextMenuItem>编辑</ContextMenuItem>
    <ContextMenuItem disabled>归档（禁用）</ContextMenuItem>
    <ContextMenuSub>
      <ContextMenuSubTrigger>移动到</ContextMenuSubTrigger>
      <ContextMenuSubContent>
        <ContextMenuItem>项目 A</ContextMenuItem>
        <ContextMenuItem>项目 B</ContextMenuItem>
      </ContextMenuSubContent>
    </ContextMenuSub>
    <ContextMenuSeparator />
    <ContextMenuItem variant="danger">删除</ContextMenuItem>
  </ContextMenuContent>
</ContextMenu>
```

勾选项与单选项（任务卡右键菜单的典型形态）：
```tsx
<ContextMenuContent>
  <ContextMenuCheckboxItem defaultChecked>置顶该任务</ContextMenuCheckboxItem>
  <ContextMenuSeparator />
  <ContextMenuGroup>
    <ContextMenuGroupLabel>优先级</ContextMenuGroupLabel>
    <ContextMenuRadioGroup value={priority} onValueChange={setPriority}>
      <ContextMenuRadioItem value="low" closeOnClick>低</ContextMenuRadioItem>
      <ContextMenuRadioItem value="medium" closeOnClick>中</ContextMenuRadioItem>
      <ContextMenuRadioItem value="high" closeOnClick>高</ContextMenuRadioItem>
    </ContextMenuRadioGroup>
  </ContextMenuGroup>
</ContextMenuContent>
```
（`closeOnClick` 是「选完即收起菜单」的写法；默认值 `false`，不传就停在菜单里继续改。）

## 禁忌 / 坑

- **一组选项别用 `ContextMenuItem` + 自己画一个 √**。视觉上与 `ContextMenuCheckboxItem` / `ContextMenuRadioItem` 完全一样，所以这个错误看不出来：但元素 role 退化成 `menuitem`、没有 `aria-checked`，读屏用户听到的是几个平级动作，听不出这是一组互斥选项、也听不出当前选的是哪个。可开关的设置用 `ContextMenuCheckboxItem`，互斥选项用 `ContextMenuRadioGroup` + `ContextMenuRadioItem`。
- `ContextMenuRadioItem` 必须放在 `ContextMenuRadioGroup` 内，否则不会有选中态。
- 勾选标记占的是与 `ContextMenuItem` 首个 `size-4` 图标同宽的第一列，混排时文字左缘因此对齐；普通项配图标同样用 `size-4`。
- 分组项必须包在 `ContextMenuGroup` 里、配 `ContextMenuGroupLabel` 才有正确分组语义；裸放 Item 则是无标题平铺列。
- `ContextMenuItem` 的 children 非纯文本（如带图标）时，补 `label` 供键盘 type-ahead 搜索。

## 相关
[Command](../command/command.md) · [Toolbar](../toolbar/toolbar.md) · [Accordion](../accordion/accordion.md) · [Collapsible](../collapsible/collapsible.md) · [Link](../link/link.md) · [AnimatedThemeToggler](../animated-theme-toggler/animated-theme-toggler.md)
