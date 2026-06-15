---
slug: popconfirm
name: Popconfirm
category: feedback
group: message
tags: []
exports: [Popconfirm]
status: enriched
---

# Popconfirm

> 气泡确认 · dogfood Popover 引擎 + 危险操作就地确认(标题/图标/确认取消) + async onConfirm loading + 受控开合 · feedback/message

## 何时用

危险/不可逆操作（删除、归档）需要就地二次确认时用：锚定到触发器旁弹出气泡，含标题/描述/确认取消按钮。比 [Toast](../toast/toast.md) 重、比全屏 Dialog 轻；需要居中、信息量大的确认弹窗用 Modal/AlertDialog，本组件适合表格行内、按钮旁的轻量确认。

## 导入
```ts
import { Popconfirm } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| danger | `boolean` | `false` | 危险操作：确认按钮 tone=danger + 默认图标转 text-danger |
| open | `boolean` | — | 受控打开态，须配合 onOpenChange |
| defaultOpen | `boolean` | `false` | 非受控初始打开态 |
| side | `"top"｜"right"｜"bottom"｜"left"` | `"top"` | 浮层方位 |
| align | `"start"｜"center"｜"end"` | `"center"` | 浮层对齐 |
| sideOffset | `number` | `8` | 浮层与触发器间距 |
| disabled | `boolean` | `false` | 禁用：触发器照常渲染但不唤起浮层 |
| className | `string` | — | 透传到浮层 Popup 的类名 |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onConfirm | `() => void \| Promise<void>` | 点确认回调。返回 Promise 时按钮进 loading，resolve 后自动关闭；reject 保持打开并清 loading |
| onCancel | `() => void` | 仅显式点取消按钮触发（点外部/Esc 走 onOpenChange，不触发此回调） |
| onOpenChange | `(open: boolean) => void` | 打开态变化回调（含点外部/Esc/确认/取消） |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| title* | `ReactNode` | 确认主问句，串 `aria-labelledby` |
| description | `ReactNode` | 次要说明，串 `aria-describedby` |
| icon | `ReactNode` | `undefined`=默认警示三角；`null`=不渲染；ReactNode=自定义。默认色随 danger 切换 |
| okText | `ReactNode` | 确认按钮文案（默认「确认」） |
| cancelText | `ReactNode` | 取消按钮文案（默认「取消」） |
| children* | `ReactElement` | 触发器（单个元素，浮层锚定到它） |

## 示例
```tsx
// 危险删除确认
<Popconfirm title="确定删除该条记录？" description="删除后不可恢复。" danger onConfirm={() => {}}>
  <Button variant="outline" tone="danger" size="sm">删除</Button>
</Popconfirm>

// 异步确认（loading 后自动关闭）
<Popconfirm
  title="确认归档？"
  okText="归档"
  onConfirm={async () => { await api.archive(id); }}
>
  <Button variant="outline" size="sm">归档</Button>
</Popconfirm>
```

## 禁忌 / 坑

- `onConfirm` 返回 Promise 时：resolve 才自动关闭，reject **保持打开并清 loading**，错误反馈（如弹 Toast）须由调用方自己负责。
- `onCancel` 只在显式点「取消」按钮时触发；点外部/按 Esc 关闭只走 `onOpenChange`，别在 onCancel 里做必跑的清理。
- `children` 必须是**单个 ReactElement**（浮层要锚定它），不能传文本或 Fragment。
- 受控用法须 `open` + `onOpenChange` 成对；只传 `open` 不传 onOpenChange 会卡死无法关闭。

## 相关
[Alert](../alert/alert.md) · [Banner](../banner/banner.md) · [Toast](../toast/toast.md) · [Notification](../notification/notification.md) · [ServiceMessage](../service-message/service-message.md) · [Result](../result/result.md)
