---
slug: live-chat
name: LiveChat
category: data-display
group: collection
tags: []
exports: [LiveChat]
status: enriched
---

# LiveChat

> 直播公屏 · 高频自动滚消息流 + message/enter(进场)/gift(送礼)/follow(关注)/system(系统)五类型默认皮肤 + 等级牌/身份徽标 + 置顶区 + 上滚查看历史时浮出「N 条新消息」恢复钮(贴底判定) + maxItems 窗口限流 + renderItem 逃生舱 + overlay 浅色态(叠加深色视频上白字) · 区别 AI 轮次制 Conversation · data-display/collection

## 何时用

直播间公屏：高频追加多类型消息（发言/进场/送礼/关注/系统公告）并自动贴底滚动。需要叠在视频上时开 `overlay`。本组件是单向广播式滚动流；要 AI 多轮问答用 [Conversation](../conversation/conversation.md)，要纯日志着色用 [LogViewer](../log-viewer/log-viewer.md)。

## 导入
```ts
import { LiveChat } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| items* | `LiveChatItem[]` | — | 消息流（受控，追加） |
| pinned | `LiveChatItem[]` | — | 顶部置顶区（公告/规则） |
| autoScroll | `boolean` | `true` | 自动滚到底；用户上滚时暂停并浮出「N 条新消息」恢复钮 |
| maxItems | `number` | `200` | 滚动窗保留上限（性能） |
| renderItem | `(item: LiveChatItem) => ReactNode` | — | 自定义单条渲染（逃生舱） |
| overlay | `boolean` | `false` | 叠在深色视频上的浅色态（文字改白/半透白 + 文字阴影） |
| className | `string` | — | 容器自定义类 |

`LiveChatItem`：`{ id: string; type: "message"｜"enter"｜"gift"｜"follow"｜"system"; user?: LiveChatUser; text?: ReactNode; gift?: { name; icon?; combo? }; at?: string }`。
`LiveChatUser`：`{ name: string; avatar?: string; level?: number; badge?: ReactNode }`（`level` 渲染等级牌，`badge` 渲染房管/铁粉等身份徽标）。

## 示例
```tsx
<LiveChat
  items={items}
  pinned={[{ id: "p1", type: "system", text: "今晚 8 点抽奖，关注不迷路" }]}
  className="h-full"
/>
```

不同 `type` 自动套对应皮肤：
```tsx
const item: LiveChatItem =
  r === 0 ? { id, type: "enter", user: { name } }
  : r === 3 ? { id, type: "gift", user: { name }, gift: { name: "小心心", icon: "💖", combo: 3 } }
  : { id, type: "message", user: { name, level: 12 }, text: "求链接" };
```

## 禁忌 / 坑

- 自动贴底依赖「当前是否贴底」判定：用户上滚查看历史时 `autoScroll` 暂停，浮出「N 条新消息」钮，点它才恢复贴底——不要在外部强行 scrollTo 干扰。
- `items` 须给容器固定高度（如 `className="h-full"` + 父容器定高），否则滚动区无法形成。
- 高频追加时靠 `maxItems` 截断窗口；不要把全量历史塞进 `items`。

## 相关
[Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md)
