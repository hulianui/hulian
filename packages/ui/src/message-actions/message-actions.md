---
slug: message-actions
name: MessageActions
category: ai
group: assist
tags: []
exports: [MessageActions]
status: enriched
---

# MessageActions

> 给一条消息配上复制、重试和点赞点踩 · ai/assist

## 何时用

挂在已生成的 assistant 消息下，提供复制/重新生成/赞/踩等操作时用（通常填进 [ChatMessage](../chat-message/chat-message.md) 的 actions 槽）。区别于 [PromptSuggestions](../prompt-suggestions/prompt-suggestions.md)（引导下一步提问），本组件针对「这条消息」的反馈与复用。各按钮按相应回调/content 是否提供而按需渲染。

## 导入
```ts
import { MessageActions } from "@hulianui/ui"
```

## Props

继承 `HTMLAttributes<HTMLDivElement>`，额外：

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| content | `string` | - | 复制目标文本；提供则显示复制键（点后 Check 反馈 1.5s） |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onCopy | `() => void` | 复制后回调（与内置剪贴板并行） |
| onRegenerate | `() => void` | 提供则显示重新生成键 |
| onLike | `() => void` | 提供则显示赞键 |
| onDislike | `() => void` | 提供则显示踩键 |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| children | `ReactNode` | 追加自定义操作键 |

## 示例
```tsx
// 全套，挂进 ChatMessage
<ChatMessage
  role="assistant"
  name="瑚琏 AI"
  actions={
    <MessageActions
      content="支持，明暗双主题 0 闪烁。"
      onRegenerate={regen}
      onLike={up}
      onDislike={down}
    />
  }
>
  支持，明暗双主题 0 闪烁。
</ChatMessage>
```

## 禁忌 / 坑

- 每个按钮按需渲染：复制键看 `content`，其余看对应回调是否传入——不传就不显示，无需额外开关。
- 复制内置剪贴板写入 + Check 反馈 1.5s，`onCopy` 是并行附加回调（埋点/toast），不需要你自己再写 `navigator.clipboard`。
- 暂无其它已知坑。

## 相关
[StreamingText](../streaming-text/streaming-text.md) · [PromptSuggestions](../prompt-suggestions/prompt-suggestions.md) · [Citation](../citation/citation.md) · [Conversation](../conversation/conversation.md) · [ChatMessage](../chat-message/chat-message.md) · [PromptInput](../prompt-input/prompt-input.md)
