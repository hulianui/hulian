---
slug: tool-call
name: ToolCall
category: ai
group: agent
tags: []
exports: [ToolCall]
status: enriched
---

# ToolCall

> 工具调用卡 · dogfood Collapsible + Dot状态色 + Spinner(运行中) · pending/running/success/error 四态 + 参数/结果折叠面板 + 工具图标 · ai/agent

## 何时用

可视化 agent 的单次工具调用（名称 + 状态 + 折叠的入参/结果）。多步任务编排用 [AgentPlan](../agent-plan/agent-plan.md)，自由文本推理用 [ThinkingBlock](../thinking-block/thinking-block.md)；这里聚焦一次 tool call 的输入输出。

## 导入
```ts
import { ToolCall } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| status | `"pending" ｜ "running" ｜ "success" ｜ "error"` | `"success"` | pending 等待 / running 运行中(转圈) / success 完成 / error 失败 |
| defaultOpen | `boolean` | — | 非受控初始展开态 |
| open | `boolean` | — | 受控展开态 |
| className | `string` | — | 容器类名 |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onOpenChange | `(open: boolean) => void` | 展开态变化回调 |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| name * | `ReactNode` | 工具名（等宽呈现，如 search_web） |
| icon | `ReactNode` | 工具图标槽（默认扳手 Wrench） |
| input | `ReactNode` | 入参（建议传 `<CodeBlock/>` 或 JSON 文本） |
| output | `ReactNode` | 结果（建议传 `<CodeBlock/>` / `<Prose/>` 或文本） |
| children | `ReactNode` | 自定义面板内容（替代 input/output） |

状态及“参数/结果”标题会随 `ConfigProvider` 的 `locale` 自动切换；未提供 Provider 时保持中文默认值。

## 示例
```tsx
<ToolCall
  name="search_web"
  status="success"
  defaultOpen
  input={<CodeBlock lang="json" code={'{ "query": "瑚琏 设计系统" }'} />}
  output="找到 3 条相关结果，已综合。"
/>

<ToolCall name="run_code" status="running" />
```

## 禁忌 / 坑

- 受控/非受控二选一：传 `open` 须配 `onOpenChange`；只想给初值用 `defaultOpen`。
- `children` 会替代 `input`/`output` 面板，二者择一传。

## 相关
[ThinkingBlock](../thinking-block/thinking-block.md) · [AgentPlan](../agent-plan/agent-plan.md) · [Dossier](../dossier/dossier.md) · [Artifact](../artifact/artifact.md) · [ConfirmCard](../confirm-card/confirm-card.md) · [ThreadList](../thread-list/thread-list.md)
