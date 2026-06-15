---
slug: context-menu
name: ContextMenu
category: navigation
group: action
tags: []
exports: [ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuGroup, ContextMenuGroupLabel, ContextMenuSub, ContextMenuSubTrigger, ContextMenuSubContent]
status: enriched
---

# ContextMenu

> 右键菜单 · Base UI context-menu 原语薄包(锚到光标) + 复用 Menu 皮肤/data-highlighted + danger · navigation/action

## 何时用

在某区域右键（或长按）弹出锚到光标的上下文菜单：编辑/复制/删除、级联子菜单、分组。需要全局搜索式命令入口用 [Command](../command/command.md)；需要常驻可见按钮排用 [Toolbar](../toolbar/toolbar.md)；ContextMenu 是绑定到目标区域、按需弹出的动作清单。复用 Menu 皮肤，支持 `variant="danger"` 危险项。

## 导入
```ts
import { ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuGroup, ContextMenuGroupLabel, ContextMenuSub, ContextMenuSubTrigger, ContextMenuSubContent } from "@hulianui/ui"
```

## Props

**ContextMenuItem**

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| children | `ReactNode` | — | 菜单项内容。 |
| onClick | `MouseEventHandler<HTMLElement>` | — | 点击回调。 |
| disabled | `boolean` | — | — |
| closeOnClick | `boolean` | `true` | 点击后是否关闭菜单。 |
| label | `string` | — | 键盘 type-ahead 用文案覆盖（children 非纯文本时补）。 |
| variant | `"default" \| "danger"` | `"default"` | danger 用危险色（删除等）。 |
| className | `string` | — | — |

**ContextMenuSubTrigger**：`children` / `disabled` / `label` / `variant?: "default" \| "danger"` / `className`。
**ContextMenuContent / ContextMenuSubContent**：`children` / `className`。
**ContextMenuTrigger / Group / GroupLabel / Separator / Sub**：结构性组件（薄包 Base UI 原语，透传 children / className）。

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

## 禁忌 / 坑

- 分组项必须包在 `ContextMenuGroup` 里、配 `ContextMenuGroupLabel` 才有正确分组语义；裸放 Item 则是无标题平铺列。
- `ContextMenuItem` 的 children 非纯文本（如带图标）时，补 `label` 供键盘 type-ahead 搜索。

## 相关
[Command](../command/command.md) · [Toolbar](../toolbar/toolbar.md) · [Accordion](../accordion/accordion.md) · [Collapsible](../collapsible/collapsible.md) · [Link](../link/link.md) · [AnimatedThemeToggler](../animated-theme-toggler/animated-theme-toggler.md)
