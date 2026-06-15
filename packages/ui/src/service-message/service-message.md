---
slug: service-message
name: ServiceMessage
category: feedback
group: message
tags: []
exports: [ServiceMessage]
status: enriched
---

# ServiceMessage

> 服务通知卡片 · 复刻微信「服务通知」会话内消息卡(模板/订阅消息) · 头部(头像+来源+⋯)/正文(标题+键值字段或自定义 children)/底部(引导文字+小程序入口) · 数据驱动 fields + onMore/onAction 交互 + footer/action 可定制 · 区别 Notification(命令式四角 toast) · 复用 Avatar/_icons·全吃 token 明暗自适配 · feedback/message

## 何时用

在「消息流 / 会话内」展示服务方下发的模板/订阅消息卡片时用（取餐提醒、物流签收、审批结果等）：头部来源、正文键值字段、底部小程序入口三段式。它是**声明式静态卡片**，渲染在内容流里；要弹出短暂反馈用 [Notification](../notification/notification.md)（命令式四角 toast）或 [Toast](../toast/toast.md)。

## 导入
```ts
import { ServiceMessage } from "@hulianui/ui"
```

## Props

继承 `Omit<HTMLAttributes<HTMLDivElement>, "title">`。

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| avatar | `AvatarProps` | — | 头部头像（复用瑚琏 Avatar 的 props，如 `{src, fallback}`） |
| source | `ReactNode` | — | 头部来源名称，如「luckincoffee 瑞幸咖啡」 |
| onMore | `() => void` | — | 头部右侧「更多」回调；提供则渲染 ⋯ 按钮 |
| title | `ReactNode` | — | 正文主标题，如「商品领取提醒」 |
| fields | `ServiceMessageField[]` | — | 正文键值对字段（`{label, value}` 左标右值）；children 提供时被覆盖 |
| children | `ReactNode` | — | 自定义正文（覆盖 fields），用于非键值结构内容 |
| footer | `ReactNode` | `"进入小程序查看"` | 底部左侧引导文字；传 `null` 隐藏整个底部 |
| action | `ServiceMessageAction` | label `"小程序"` | 底部右侧动作（`{label?, icon?}` + chevron） |
| onAction | `() => void` | — | 底部行点击回调；提供则整行成为可点击 button |

## 示例
```tsx
// 数据驱动键值字段
<ServiceMessage
  avatar={{ fallback: "瑞", className: "bg-primary/10 text-primary" }}
  source="luckincoffee 瑞幸咖啡"
  onMore={() => {}}
  title="商品领取提醒"
  fields={[
    { label: "取餐号", value: "361" },
    { label: "商品数量", value: "1" },
    { label: "商品详情", value: "橙C冰茶" },
  ]}
  action={{ icon: <LayoutGrid className="size-3.5 text-primary" /> }}
  onAction={() => {}}
/>

// 自定义正文 children（覆盖 fields）+ 自定义动作文字
<ServiceMessage
  avatar={{ fallback: "顺", className: "bg-warning/15 text-warning" }}
  source="顺丰速运"
  title="您的包裹已签收"
  footer="查看物流详情"
  action={{ label: "详情" }}
  onAction={() => {}}
>
  <p className="text-sm text-foreground">您的快件已由本人签收。</p>
</ServiceMessage>
```

## 禁忌 / 坑

- `children` 与 `fields` 互斥：传了 `children` 则 `fields` 被忽略，二选一。
- 不传 `onMore` 就不渲染 ⋯ 按钮；不传 `onAction` 则底部行不可点击——交互按需挂回调，别给空函数误以为生效。
- `footer={null}` 会隐藏**整个底部**（含右侧 action），不只是引导文字。
- 暂无其它已知坑。

## 相关
[Alert](../alert/alert.md) · [Banner](../banner/banner.md) · [Toast](../toast/toast.md) · [Notification](../notification/notification.md) · [Result](../result/result.md) · [GiftFeed](../gift-feed/gift-feed.md)
