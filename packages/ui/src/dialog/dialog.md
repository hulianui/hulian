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
| `DialogContent.title` * | `ReactNode` | — | 标题（a11y label）。收 ReactNode，「图标 + 文案」直接写 |
| `DialogContent.description` | `ReactNode` | — | 说明文案。渲染成 `<p>`，**只能放 phrasing content**（块级内容放 children） |
| `DialogContent.descriptionClassName` | `string` | — | 追加到说明文案（走 twMerge）。传 `sr-only` 即「只给读屏的说明」——面包屑式标题的弹窗里可见区只留标题，读屏仍拿得到那句话 |
| `DialogContent.backdrop` | `boolean` | `true` | 是否渲染遮罩。`false` + Root 的 `modal={false}` 才是真正的非模态（只关一边不成立：遮罩那层 `inset-0` 即使透明也吃掉整屏点击） |
| `DialogContent.backdropClassName` | `string` | — | 追加到遮罩（默认 `bg-black/40 backdrop-blur-sm`），走 twMerge，可调浓度/模糊 |
| `DialogContent.scrollable` | `boolean` | `true` | 正文区是否自带纵向滚动。`false` 时正文变成列向 flex 容器，把确定高度传给 children（双栏各自滚动即写 `flex-1 min-h-0`，不必拍 `h-[58vh]`） |
| `DialogContent.bodyClassName` | `string` | — | 追加到正文区容器 |
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

- 非模态浮层要**两处一起改**：Root 传 `modal={false}`（让焦点与滚动锁失效）+ Content 传 `backdrop={false}`（不渲染遮罩）。只改前者时那层 `fixed inset-0` 仍在，透明也照样吃掉整屏点击，"非模态"等于没生效。
- `scrollable={false}` 之后**纵向滚动归你自己**：正文区只负责把确定高度传下去（列向 flex），子级要自己写 `overflow-y-auto`。忘了写就是整块内容被 `max-h` 裁掉。

- `DialogTrigger` / `DialogClose` 用 `render={<Button…/>}` 把自家行为合并到目标元素上，**不要**再额外包一层按钮，否则会出现嵌套交互元素 / 双重 onClick。
- 操作按钮优先放 `footer` 槽（带分隔线、右对齐），正文 `children` 留给主内容。

## 相关
[Modal](../modal/modal.md) · [AlertDialog](../alert-dialog/alert-dialog.md) · [Drawer](../drawer/drawer.md) · [Popover](../popover/popover.md) · [Tooltip](../tooltip/tooltip.md) · [HoverCard](../hover-card/hover-card.md)
