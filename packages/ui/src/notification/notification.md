---
slug: notification
name: Notification
category: feedback
group: message
tags: []
exports: [notification, NotificationProvider, hulianNotificationManager]
status: enriched
---

# Notification

> 通知 · 四角堆叠卡片 + 图标/操作区/位置 + 命令式 API(比 Toast 重) · feedback/message

## 何时用

需要在四角弹出**带标题+描述+操作按钮**的较重通知卡片时用（比如「收到好友请求 / 上传失败可重试」）。比 [Toast](../toast/toast.md) 信息量大、可常驻、可带操作；只需一行短反馈、自动消失时用 Toast。命令式调用，无需在 JSX 里挂节点（但 `NotificationProvider` 须由 layout 单挂一次）。

## 导入
```ts
import { notification, NotificationProvider, hulianNotificationManager } from "@hulianui/ui"
```

## Props

`notification.success/error/info/warning/open(options)` 接收 `NotificationOptions`：

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| type | `"open"｜"success"｜"error"｜"info"｜"warning"` | — | 经方法名隐含（`open` 为中性无图标）；派生左侧色条 + 默认图标，token 取值同 Alert（`info` 走 `--color-info`，0.8.0 前借主色） |
| duration | `number` | `4500` | 自动关闭毫秒数；`0` = 不自动关（常驻） |
| placement | `"topRight"｜"topLeft"｜"bottomRight"｜"bottomLeft"` | `"topRight"` | 弹出位置（四角） |

调用返回 `NotificationInstance`，含 `destroy(): void` 立即关闭该通知。

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onClose | `() => void` | 关闭时回调（自动/手动/编程关闭均触发一次） |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| title | `ReactNode` | 标题（加粗主行） |
| description | `ReactNode` | 描述（次行，恒 text-muted-foreground） |
| icon | `ReactNode` | 自定义图标，覆盖默认（不传按类型派生） |
| btn | `ReactNode` | 操作区（按钮等），渲染在描述下方 |

## 示例
```tsx
// 普通成功通知（4.5s 自动关闭）
notification.success({ title: "保存成功", description: "更改已同步。" })

// 带操作按钮 + 常驻（duration:0）
notification.open({
  title: "收到一条好友请求",
  description: "来自 设计部·小琏",
  duration: 0,
  btn: <Button size="sm" onClick={() => {}}>查看</Button>,
})
```

## 禁忌 / 坑

- `NotificationProvider` 须在 layout 单挂一次（同 Toast/Modal 范式），不要在每个调用点或 showcase 里挂 Provider，否则通知无处渲染。
- `duration: 0` 才是常驻；不传 duration 默认 4500ms 自动关，需要用户必看的通知务必显式置 0。
- 命令式触发的副作用通知，注意「触发即忘」的回调语义——`onClose` 仅保证触发一次，别在其中做依赖外部最新状态的操作。参见 [[fire-and-forget-side-effect-notification]]。

## 相关
[Alert](../alert/alert.md) · [Banner](../banner/banner.md) · [Toast](../toast/toast.md) · [ServiceMessage](../service-message/service-message.md) · [Result](../result/result.md) · [GiftFeed](../gift-feed/gift-feed.md)
