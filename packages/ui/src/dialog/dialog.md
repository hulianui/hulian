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

> 在模态浮层里承载内容，并锁住键盘焦点 · feedback/overlay

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
| `DialogContent.title` | `ReactNode` | - | 标题（a11y 名字的常规来源）。收 ReactNode，「图标 + 文案」直接写。承载元素是 `<h2>`，**只收 phrasing content**，按钮组放 `extra`。0.47.0 起由必填改为可选（见下方「对话框必须有名字」） |
| `DialogContent.extra` | `ReactNode` | - | 标题右侧的操作区，与标题同排右对齐，**不参与无障碍名** |
| `DialogContent.description` | `ReactNode` | - | 说明文案。渲染成 `<p>`，**只能放 phrasing content**（块级内容放 children） |
| `DialogContent.aria-label` | `string` | - | 对话框的无障碍名，直接落到 popup 上。不传 `title` 时用它（铺满型对话框的可见 header 由消费方自己画） |
| `DialogContent.aria-labelledby` | `string` | - | 无障碍名的来源元素 id，优先于 `title` 自动生成的 id。与 `aria-label` 二选一 |
| `DialogContent.showClose` | `boolean` | `true` | 右上角关闭按钮（#279，形状与默认值对齐 DrawerContent）。只读详情型对话框（没有 footer）此前唯一可见退路是点遮罩，键盘只剩 Esc，读屏没有「关闭」可达元素。开着时标题/`extra` 行自动让出右上角 40px。全局搜索框这类自带关闭手段的弹层传 `false` |
| `DialogContent.closeLabel` | `string` | locale `dialog.close` | 关闭按钮的无障碍名，缺省吃 ConfigProvider locale（zh「关闭」/ en "Close"） |
| `DialogContent.titleClassName` | `string` | - | 追加到标题（默认 `text-lg font-semibold`），走 twMerge |
| `DialogContent.descriptionClassName` | `string` | - | 追加到说明文案（走 twMerge）。传 `sr-only` 即「只给读屏的说明」——面包屑式标题的弹窗里可见区只留标题，读屏仍拿得到那句话 |
| `DialogContent.backdrop` | `boolean` | `true` | 是否渲染遮罩。`false` + Root 的 `modal={false}` 才是真正的非模态（只关一边不成立：遮罩那层 `inset-0` 即使透明也吃掉整屏点击） |
| `DialogContent.backdropClassName` | `string` | - | 追加到遮罩（默认 `bg-black/40 backdrop-blur-sm`），走 twMerge，可调浓度/模糊 |
| `DialogContent.scrollable` | `boolean` | `true` | 正文区是否自带纵向滚动。`false` 时正文变成列向 flex 容器，把确定高度传给 children（双栏各自滚动即写 `flex-1 min-h-0`，不必拍 `h-[58vh]`） |
| `DialogContent.bodyClassName` | `string` | - | 追加到正文区容器 |
| `DialogContent.className` | `string` | - | 内容容器类名 |

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

### 对话框必须有名字

`title` 在 0.47.0 之前是必填，但那不真的保证有名字 —— `title={null}` 一样过类型检查，渲染出的是个空 `<h2>`。改成可选之后，保证换成了运行时告警：`title` / `aria-label` / `aria-labelledby` **三者全无**时开发期会打一条 warn。

因此「可见 header 是一行控件」的铺满型对话框不必再塞一个 `sr-only` 的假标题：

```tsx
<DialogContent aria-label="通知" className="p-0 [--hl-overlay-pad:0px]">
  <div className="flex items-center justify-between border-b px-4 py-3">…</div>
  {/* 正文 */}
</DialogContent>
```

标题旁只是要摆几个按钮时用 `extra`，别把整行塞进 `title`：`<h2>` 只收 phrasing content，而 `aria-labelledby` 指向整个 `<h2>`，按钮文案会被一起念进对话框的名字里。同款槽见 [DrawerContent.extra](../drawer/drawer.md) 与 [CardHeader.extra](../card/card.md)。

## 相关
[Modal](../modal/modal.md) · [AlertDialog](../alert-dialog/alert-dialog.md) · [Drawer](../drawer/drawer.md) · [Popover](../popover/popover.md) · [Tooltip](../tooltip/tooltip.md) · [HoverCard](../hover-card/hover-card.md)
