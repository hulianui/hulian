---
slug: chat-message
name: ChatMessage
category: ai
group: conversation
tags: []
exports: [ChatMessage]
status: enriched
---

# ChatMessage

> 对话气泡 · user右(primary)/assistant左(surface)/system居中 + 头像(复用Avatar)/名称/时间 + loading态(TypingDots) + 操作槽 · ai/conversation

## 何时用

渲染单条对话气泡（用户/助手/系统通告）。多条气泡的滚动堆叠交给 [Conversation](../conversation/conversation.md)；气泡下方的操作按钮用 MessageActions 放进 `actions` 槽。

头像回退文案与发送回执的无障碍标签跟随最近的 `ConfigProvider` locale；默认 `zhCN`，切换 `enUS` 后使用英文。

## 导入
```ts
import { ChatMessage } from "@hulianui/ui"
```

## Props

继承 `Omit<HTMLAttributes<HTMLDivElement>, "title">`。

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| role * | `"user" ｜ "assistant" ｜ "system"` | `"assistant"`(showcase) | user 右对齐(primary 底) / assistant 左对齐(surface 底) / system 居中弱化通告 |
| loading | `boolean` | `false` | 加载态：正文位置显示 TypingDots（agent 生成中） |
| status | `"sending" ｜ "sent" ｜ "read"` | — | 已读回执：仅 role=user 渲染。sending 转圈 / sent 单勾 / read 双蓝勾 |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| children | `ReactNode` | 正文；markdown 建议外层包 `<Prose/>`，纯文本直接传 |
| avatar | `ReactNode` | 头像槽（传瑚琏 `<Avatar/>`）；不传用角色默认字符 fallback。system 不渲染头像 |
| name | `ReactNode` | 发送者名称（正文上方） |
| timestamp | `ReactNode` | 时间戳（名称右侧，弱化色） |
| actions | `ReactNode` | 底部操作区槽（放 `<MessageActions/>`，仅气泡下方） |

## 示例
```tsx
<ChatMessage role="user" name="我" timestamp="刚刚">
  帮我把首页重写成 100% dogfood
</ChatMessage>

<ChatMessage role="assistant" name="瑚琏 AI" loading>占位</ChatMessage>
```

## 禁忌 / 坑

- `status` 已读回执仅在 `role="user"`（右气泡）渲染，传给 assistant/system 不显示。
- `loading` 为真时正文被 TypingDots 替换，`children` 仅作占位不展示。

## 相关
[Conversation](../conversation/conversation.md) · [PromptInput](../prompt-input/prompt-input.md) · [TypingDots](../typing-dots/typing-dots.md) · [ThinkingBlock](../thinking-block/thinking-block.md) · [ToolCall](../tool-call/tool-call.md) · [AgentPlan](../agent-plan/agent-plan.md)
