---
slug: gift-feed
name: GiftFeed
category: feedback
group: message
tags: [animated]
exports: [GiftFeed, applyGiftEvent]
status: enriched
---

# GiftFeed

> 礼物连击 · 受控礼物事件流 + 同 id 连击合并 combo ×N 滚动弹跳计数(纯函数 applyGiftEvent 可测) + 横幅左滑入/自动消散计时(每连击重置) + max 同屏上限挤旧 + dogfood Avatar · 直播打赏特效(pointer-events none) · feedback/message · #animated

## 何时用

直播间/互动场景展示打赏礼物连击横幅时用：同一用户对同一礼物快速连点合并为 `combo ×N` 弹跳计数、自动消散、同屏上限挤旧。它是**叠在内容之上的特效层**（`pointer-events:none`）；通用结果反馈用 [Result](../result/result.md)，普通通知用 [Notification](../notification/notification.md)。配合 [FloatingReactions](../floating-reactions/floating-reactions.md) 做点赞飘心。

## 导入
```ts
import { GiftFeed, applyGiftEvent } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| events* | `GiftEvent[]` | — | 受控礼物事件流（追加）。`GiftEvent` = `{id, user:{name,avatar?}, gift:{name,icon?,color?}, combo?}`，同 `id` 再次传入视为同一连击 |
| max | `number` | `3` | 同时显示横幅上限（超出挤掉最旧） |
| duration | `number` | `4000` | 单条无新连击后停留 ms |
| className | `string` | — | 容器类名 |

`applyGiftEvent` 为纯函数：把一个 `GiftEvent` 归并进当前在屏横幅数组（同 id 合并、combo 递增、超 max 挤旧），可单独单元测试。

## 示例
```tsx
const [events, setEvents] = useState<GiftEvent[]>([]);

// 收到打赏时追加事件（combo 由调用方维护）
function onGift(g: GiftEvent) {
  setEvents((prev) => [...prev.slice(-30), g]);
}

<div className="relative h-72 w-80">
  <GiftFeed events={events} max={3} duration={4000} className="w-full" />
</div>
```

## 禁忌 / 坑

- `events` 是「追加流」语义：靠 `id` 区分是否同一连击，同 id 才合并 combo。不同礼物务必给不同 `id`，否则会被误并为连击。
- `combo` 由调用方维护并递增（组件只负责动画呈现）；不传则按出现次数自增。
- 注意 `events` 数组无限增长会占内存，示例里用 `.slice(-30)` 截断；生产同理别让它无界累积。
- 暂无其它已知坑。

## 相关
[Alert](../alert/alert.md) · [Banner](../banner/banner.md) · [Toast](../toast/toast.md) · [Notification](../notification/notification.md) · [ServiceMessage](../service-message/service-message.md) · [Result](../result/result.md)
