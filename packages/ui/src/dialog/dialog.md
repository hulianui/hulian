---
slug: dialog
name: Dialog
category: feedback
group: overlay
tags: []
exports: [Dialog, DialogTrigger, DialogClose, DialogContent]
status: enriched
---

# Dialog

> 对话框 · Base UI Portal + focus trap · feedback/overlay

## 何时用

需要打断当前流程、在遮罩层上承载表单/详情/确认内容时用，自带 Portal + 焦点锁 + Esc 关闭。命令式一行弹（confirm/info/success）用 [Modal](../modal/modal.md)；强制决策不让点遮罩关用 [AlertDialog](../alert-dialog/alert-dialog.md)；侧滑面板用 [Drawer](../drawer/drawer.md)。

## 导入
```ts
import { Dialog, DialogTrigger, DialogClose, DialogContent } from "@hulianui/ui"
```

## Props

`Dialog` / `DialogTrigger` / `DialogClose` 为 Base UI Dialog 对应原语薄包（`Dialog` 透传 Root 的 `open`/`defaultOpen`/`onOpenChange` 等；`DialogTrigger`/`DialogClose` 支持 `render` 接管渲染元素）。`DialogContent` 为瑚琏皮肤：

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `DialogContent.title` * | `string` | — | 标题（a11y label） |
| `DialogContent.description` | `string` | — | 说明文案 |
| `DialogContent.className` | `string` | — | 内容容器类名 |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| `Dialog.onOpenChange` | `(open: boolean) => void` | 开关态变化回调（透传 Base UI Dialog Root） |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| `DialogContent.footer` | `ReactNode` | 底部操作区，渲染在正文下方，顶部分隔线 + 右对齐，与 DrawerContent 对齐 |
| `DialogContent.children` | `ReactNode` | 正文内容 |

## 示例
```tsx
<Dialog>
  <DialogTrigger render={<Button variant="outline">打开对话框</Button>} />
  <DialogContent
    title="瑚琏对话框"
    description="Tab 不出框，Esc 关闭，焦点归还触发按钮。"
  >
    <div className="flex justify-end gap-2">
      <DialogClose render={<Button variant="ghost">取消</Button>} />
      <DialogClose render={<Button>确定</Button>} />
    </div>
  </DialogContent>
</Dialog>
```

## 禁忌 / 坑

- `DialogTrigger` / `DialogClose` 用 `render={<Button…/>}` 把自家行为合并到目标元素上，**不要**再额外包一层按钮，否则会出现嵌套交互元素 / 双重 onClick。
- 操作按钮优先放 `footer` 槽（带分隔线、右对齐），正文 `children` 留给主内容。

## 相关
[Modal](../modal/modal.md) · [AlertDialog](../alert-dialog/alert-dialog.md) · [Drawer](../drawer/drawer.md) · [Popover](../popover/popover.md) · [Tooltip](../tooltip/tooltip.md) · [HoverCard](../hover-card/hover-card.md)
