---
slug: tooltip
name: Tooltip
category: feedback
group: overlay
tags: []
exports: [Tooltip, TooltipTrigger, TooltipProvider, TooltipContent]
status: enriched
---

# Tooltip

> 提示浮层 · Base UI Positioner + 箭头 + hover 触发 · feedback/overlay

## 何时用

hover/focus 触发的纯文本短提示（图标含义、截断文字全文、操作说明）。承载富内容（头像 + 简介卡片）用 [HoverCard](../hover-card/hover-card.md)；click 触发 + 带操作按钮用 [Popover](../popover/popover.md)。`delay` / `closeDelay` 在 `TooltipProvider` 上，不在 `Tooltip` 上。

## 导入
```ts
import { Tooltip, TooltipTrigger, TooltipProvider, TooltipContent } from "@hulianui/ui"
```

## Props

`TooltipContent`：

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| children* | `ReactNode` | — | 提示文案 |
| side | `"top"｜"right"｜"bottom"｜"left"` | `"top"` | 浮层方位 |
| align | `"start"｜"center"｜"end"` | `"center"` | 对齐 |
| sideOffset | `number` | — | 与触发器的间距 |
| className | `string` | — | 额外类名 |

`TooltipProvider` 接 `delay` / `closeDelay`（ms）控制开合延迟；`TooltipTrigger` 用 `render` prop 接管触发元素。

## 示例
```tsx
<TooltipProvider delay={0} closeDelay={0}>
  <Tooltip>
    <TooltipTrigger render={<Button variant="outline">悬停查看</Button>} />
    <TooltipContent side="top" align="center">瑚琏提示</TooltipContent>
  </Tooltip>
</TooltipProvider>
```

## 禁忌 / 坑

- `delay`/`closeDelay` 写在 `TooltipProvider` 而非 `Tooltip`；截图/稳态验收时把两者设 0 让 hover 即开。
- 在 flex 行内（带 `text-overflow:ellipsis` + `min-w-0`）用 Tooltip 包裹文本时，触发器 wrapper 若是 `inline-block` 会按内容固有宽撑开、绕过父级宽度约束破坏截断（同类问题见 [[heroui-tooltip-trigger-inline-block-breaks-flex-truncation]]）；本组件用 `render` 注入元素时确保触发元素本身保持 `block; min-w-0`。

## 相关
[Dialog](../dialog/dialog.md) · [Modal](../modal/modal.md) · [AlertDialog](../alert-dialog/alert-dialog.md) · [Drawer](../drawer/drawer.md) · [Popover](../popover/popover.md) · [HoverCard](../hover-card/hover-card.md)
