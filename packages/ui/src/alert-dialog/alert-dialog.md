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

> 对高风险操作要求明确确认，不能随手关掉 · feedback/overlay

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
| `AlertDialogContent.className` | `string` | - | 内容容器类名 |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| `AlertDialog.onOpenChange` | `(open: boolean) => void` | 开关态变化回调（透传 Base UI AlertDialog Root） |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| `AlertDialogContent.title` * | `ReactNode` | 标题（a11y label，必填） |
| `AlertDialogContent.description` | `ReactNode` | 说明文案。**只能放 phrasing content**（文本 / `span` / `strong` / `a`），它渲染成 `<p>`；块级内容放 `body` |
| `AlertDialogContent.body` | `ReactNode` | 正文区，渲染在 `description` 之下、动作区之上，不包 `<p>`，可放块级内容（删除对象摘要卡、受影响项列表） |
| `AlertDialogContent.icon` | `ReactNode` | 标题行左侧的状态图标；组件只做 flex 对齐，颜色自己给（危险 `text-danger` / 警告 `text-warning`） |
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

带正文块与状态图标：
```tsx
<AlertDialog>
  <AlertDialogTrigger className="…">删除合同模板</AlertDialogTrigger>
  <AlertDialogContent
    icon={<WarnIcon className="text-danger" />}
    title="确认删除合同模板"
    description="将从合同库 / 公开库 / 各公司库中一并移除，无法恢复。"
    body={
      <div className="rounded-[var(--radius)] border border-border p-3">
        <div className="font-medium">冠亚/全日制劳动合同</div>
        <div className="text-xs text-muted-foreground">副本冠亚-全日制劳动合同文本.docx</div>
      </div>
    }
  >
    <AlertDialogClose className="…">取消</AlertDialogClose>
    <AlertDialogClose className="…">永久删除</AlertDialogClose>
  </AlertDialogContent>
</AlertDialog>
```

## 禁忌 / 坑

- **`description` 只能放 phrasing content**（文本、`<span>`、`<strong>`、`<a>`）。它底层是 `AlertDialog.Description`，渲染成 `<p>`；塞 `<div>` / `<ul>` / 卡片是非法嵌套，浏览器会提前闭合 `<p>`，React 报 hydration mismatch。**块级正文一律放 `body`**，别用 `<span className="block">` 去绕。
- `children` 是**底部动作区**（`justify-end` 的按钮行），不是正文——正文塞进去会和按钮挤在一行。这与 [Dialog](../dialog/dialog.md) 相反（Dialog 的 `children` 是正文、`footer` 才是动作区），两边不要照抄。
- `icon` 只负责与标题/说明的 flex 对齐，**不带颜色**：危险操作自己给 `text-danger`，警告给 `text-warning`，否则它就是普通前景色。
- AlertDialog 的弹窗没有内部滚动区（不同于 Dialog 的 `max-h` + 正文滚动），`body` 放长内容会把弹窗顶穿视口——需要长正文说明这已经不是"强制决策"场景，改用 Dialog。
- 故意不响应点遮罩/Esc 关闭——这是 AlertDialog 的设计意图（强制决策）；想要可随手关闭就改用 Dialog，别在这里恢复轻关闭行为。
- 取消按钮必须用 `AlertDialogClose` 才能关闭弹窗；确认按钮通常也用 `AlertDialogClose` 包裹并在其 onClick 执行操作。

## 相关
[Dialog](../dialog/dialog.md) · [Modal](../modal/modal.md) · [Drawer](../drawer/drawer.md) · [Popover](../popover/popover.md) · [Tooltip](../tooltip/tooltip.md) · [HoverCard](../hover-card/hover-card.md)
