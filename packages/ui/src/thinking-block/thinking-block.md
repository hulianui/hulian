---
slug: thinking-block
name: ThinkingBlock
category: ai
group: agent
tags: [animated]
exports: [ThinkingBlock]
status: enriched
---

# ThinkingBlock

> 思考折叠块 · dogfood Collapsible(自带chevron+平滑高度) + thinking态(转圈+AnimatedShinyText高光+默认展开) + 耗时标记·收起隐藏 chain-of-thought · ai/agent · #animated

## 何时用

折叠展示 agent 的 chain-of-thought 推理过程，思考中转圈高光、完成后可收起。结构化的步骤清单用 [AgentPlan](../agent-plan/agent-plan.md)，单次工具调用用 [ToolCall](../tool-call/tool-call.md)；这里是自由文本推理。

## 导入
```ts
import { ThinkingBlock } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| thinking | `boolean` | `false` | 进行态：标题转圈 + 高光流动，且默认展开（agent 正在推理） |
| defaultOpen | `boolean` | 随 thinking | 非受控初始展开态 |
| open | `boolean` | - | 受控展开态 |
| className | `string` | - | 容器类名 |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onOpenChange | `(open: boolean) => void` | 展开态变化回调 |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| title | `ReactNode` | 头部标题（默认「思考过程」） |
| duration | `ReactNode` | 耗时标记（标题右侧弱化，如「思考 3s」） |
| children | `ReactNode` | 推理正文（markdown 建议外包 `<Prose/>`） |

## 示例
```tsx
<ThinkingBlock duration="思考 3s">{reasoning}</ThinkingBlock>

// 推理中：转圈 + 高光 + 默认展开
<ThinkingBlock thinking>{reasoning}</ThinkingBlock>
```

## 禁忌 / 坑

- 受控/非受控二选一：传 `open` 须配 `onOpenChange` 自己管；只想给初值用 `defaultOpen`。
- 不传 `defaultOpen`/`open` 时展开态默认随 `thinking`（思考中展开、完成收起）。

## 相关
[ToolCall](../tool-call/tool-call.md) · [AgentPlan](../agent-plan/agent-plan.md) · [Dossier](../dossier/dossier.md) · [Artifact](../artifact/artifact.md) · [ConfirmCard](../confirm-card/confirm-card.md) · [ThreadList](../thread-list/thread-list.md)
