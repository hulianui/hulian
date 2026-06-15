---
slug: modal
name: Modal
category: feedback
group: overlay
tags: []
exports: [modal, ModalProvider, hulianModalManager]
status: enriched
---

# Modal

> 命令式对话框 · confirm/info/success/error/warning 函数式 API + Dialog 引擎 · feedback/overlay

## 何时用

逻辑流程里需要一行代码弹确认/提示（删除确认、操作结果反馈）时用，无需在 JSX 里铺 Trigger/Content。需要复杂自定义内容 / 表单的声明式弹窗用 [Dialog](../dialog/dialog.md)；强制决策的破坏性确认用 [AlertDialog](../alert-dialog/alert-dialog.md)。

## 导入
```ts
import { modal, ModalProvider, hulianModalManager } from "@hulianui/ui"
```

## API / Options

调用入口：`modal.confirm(opts)` / `modal.info` / `modal.success` / `modal.error` / `modal.warning`，返回 `ModalInstance`。语调由入口隐含。`ModalProvider` 需在应用根挂一次（同 Toast 范式）。

`ModalOptions`：

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `title` | `ReactNode` | — | 标题（加粗主行） |
| `content` | `ReactNode` | — | 正文内容 |
| `okText` | `ReactNode` | `"确定"` | 确定按钮文案 |
| `cancelText` | `ReactNode` | `"取消"` | 取消按钮文案（仅 confirm 渲染取消键） |
| `onOk` | `() => void \| Promise<unknown>` | — | 点确定回调；返回 Promise 时确定键进 loading，resolve → 自动关闭，reject → 保持打开 |
| `onCancel` | `() => void` | — | 点取消 / Esc / 点遮罩关闭时回调 |
| `type` | `"confirm" \| "info" \| "success" \| "error" \| "warning"` | — | 语调；命令式入口已隐含，一般无需显式传 |

`ModalInstance`：`destroy()` 立即关闭销毁；`update(next)` 更新已打开对话框配置。

## 示例
```tsx
// 根布局挂一次
<ModalProvider />

// 任意逻辑处调用
modal.confirm({
  title: "确认删除该记录？",
  content: "删除后无法恢复。",
  onOk: () => {},
});

// 异步确定：确定键自动 loading，resolve 后关闭
modal.confirm({
  title: "提交订单？",
  content: "点确定将发起请求。",
  onOk: () => fetch("/api/order", { method: "POST" }),
});
```

## 禁忌 / 坑

- 必须在应用根挂一次 `ModalProvider`，否则命令式调用无处渲染；showcase 里也是 layout 单挂、触发按钮里只调 `modal.*`（同 Toast）。
- `onOk` 返回 Promise 时：resolve 才自动关闭，reject 会保持打开（由调用方提示错误）——别在 reject 分支里又手动 `destroy`。

## 相关
[Dialog](../dialog/dialog.md) · [AlertDialog](../alert-dialog/alert-dialog.md) · [Drawer](../drawer/drawer.md) · [Popover](../popover/popover.md) · [Tooltip](../tooltip/tooltip.md) · [HoverCard](../hover-card/hover-card.md)
