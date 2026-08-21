---
slug: toolbar
name: Toolbar
category: navigation
group: action
tags: []
exports: [Toolbar, ToolbarButton, ToolbarToggle, ToolbarGroup, ToolbarSeparator]
status: enriched
---

# Toolbar

> 把一组操作控件排成工具栏，焦点可键盘漫游 · navigation/action

## 何时用

一排相关的操作控件（富文本格式、对齐、分享等）横/竖排，带 `role=toolbar` 与方向键漫游焦点。需要点击弹出的命令清单用 [ContextMenu](../context-menu/context-menu.md)；需要 ⌘K 搜索式命令面板用 [Command](../command/command.md)；Toolbar 是常驻可见的一排按钮/开关。

## 导入
```ts
import { Toolbar, ToolbarButton, ToolbarToggle, ToolbarGroup, ToolbarSeparator } from "@hulianui/ui"
```

## Props

**Toolbar**

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| orientation | `"horizontal" \| "vertical"` | `"horizontal"` | 排布方向。 |
| disabled | `boolean` | - | 整条禁用。 |
| loopFocus | `boolean` | `true` | 键盘导航到末端时是否回环。 |
| aria-label | `string` | - | 工具栏无障碍标签。 |
| className | `string` | - | - |

**ToolbarButton**

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| disabled | `boolean` | - | - |
| aria-label | `string` | - | 图标按钮需补无障碍标签。 |
| className | `string` | - | - |

**ToolbarToggle**

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| pressed | `boolean` | - | 受控选中态（按下=开）。 |
| defaultPressed | `boolean` | `false` | 非受控初始选中态。 |
| disabled | `boolean` | - | - |
| aria-label | `string` | - | - |
| className | `string` | - | - |

**ToolbarGroup**：Props `disabled` / `aria-label` / `className`；Slots `children`。
**ToolbarSeparator**：Props `orientation?: "horizontal" \| "vertical"` / `className`。

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onClick | `(e: MouseEvent<HTMLButtonElement>) => void` | `ToolbarButton` 点击回调。 |
| onPressedChange | `(pressed: boolean) => void` | `ToolbarToggle` 选中态变化回调。 |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| children | `ReactNode` | `Toolbar` / `ToolbarButton` / `ToolbarToggle` / `ToolbarGroup` 各自的子内容。 |

## 示例
```tsx
<Toolbar aria-label="文本格式">
  <ToolbarGroup>
    <ToolbarToggle aria-label="加粗" defaultPressed><Bold className="size-4" /></ToolbarToggle>
    <ToolbarToggle aria-label="斜体"><Italic className="size-4" /></ToolbarToggle>
  </ToolbarGroup>
  <ToolbarSeparator />
  <ToolbarButton aria-label="分享"><Share2 className="size-4" />分享</ToolbarButton>
</Toolbar>
```

## 禁忌 / 坑

- 纯图标的 `ToolbarButton`/`ToolbarToggle` 必须补 `aria-label`，否则屏幕阅读器读不出。
- `ToolbarToggle` 受控（`pressed`）与非受控（`defaultPressed`）二选一，混用会导致状态不一致。

## 相关
[Command](../command/command.md) · [ContextMenu](../context-menu/context-menu.md) · [Accordion](../accordion/accordion.md) · [Collapsible](../collapsible/collapsible.md) · [Link](../link/link.md) · [AnimatedThemeToggler](../animated-theme-toggler/animated-theme-toggler.md)
