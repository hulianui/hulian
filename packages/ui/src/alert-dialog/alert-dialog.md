---
slug: alert-dialog
name: AlertDialog
category: feedback
group: overlay
tags: []
exports: [AlertDialog, AlertDialogTrigger, AlertDialogClose, AlertDialogContent]
status: enriched
---

# AlertDialog

> 确认对话框 · Base UI 强制决策(不点遮罩/Esc 关) + Dialog 引擎 · feedback/overlay

## 何时用

破坏性/不可逆操作前强制用户明确决策时用（删除、清空、退出未保存），点遮罩和 Esc **不会**关闭，必须点取消或确认。普通可随手关的对话框用 [Dialog](../dialog/dialog.md)；一行命令式确认用 [Modal](../modal/modal.md)。

## 导入
```ts
import { AlertDialog, AlertDialogTrigger, AlertDialogClose, AlertDialogContent } from "@hulianui/ui"
```

## Props

`AlertDialog` / `AlertDialogTrigger` / `AlertDialogClose` 为 Base UI AlertDialog 对应原语薄包（Trigger/Close 可传 `className` 或 `render` 接管元素）。`AlertDialogContent` 为瑚琏皮肤：

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `AlertDialogContent.className` | `string` | — | 内容容器类名 |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| `AlertDialog.onOpenChange` | `(open: boolean) => void` | 开关态变化回调（透传 Base UI AlertDialog Root） |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| `AlertDialogContent.title` * | `ReactNode` | 标题（a11y label，必填） |
| `AlertDialogContent.description` | `ReactNode` | 说明文案 |
| `AlertDialogContent.children` | `ReactNode` | 底部操作区，放「取消 / 确认」按钮（取消用 `AlertDialogClose`） |

## 示例
```tsx
<AlertDialog>
  <AlertDialogTrigger className="…">删除项目</AlertDialogTrigger>
  <AlertDialogContent title="删除项目？" description="此操作不可撤销，项目数据将被永久删除。">
    <AlertDialogClose className="…">取消</AlertDialogClose>
    <AlertDialogClose className="…">删除</AlertDialogClose>
  </AlertDialogContent>
</AlertDialog>
```

## 禁忌 / 坑

- 故意不响应点遮罩/Esc 关闭——这是 AlertDialog 的设计意图（强制决策）；想要可随手关闭就改用 Dialog，别在这里恢复轻关闭行为。
- 取消按钮必须用 `AlertDialogClose` 才能关闭弹窗；确认按钮通常也用 `AlertDialogClose` 包裹并在其 onClick 执行操作。

## 相关
[Dialog](../dialog/dialog.md) · [Modal](../modal/modal.md) · [Drawer](../drawer/drawer.md) · [Popover](../popover/popover.md) · [Tooltip](../tooltip/tooltip.md) · [HoverCard](../hover-card/hover-card.md)
