---
slug: agent-plan
name: AgentPlan
category: ai
group: agent
tags: []
exports: [AgentPlan]
status: enriched
---

# AgentPlan

> 列出智能体的执行计划，逐条标出进行和完成 · ai/agent

## 何时用

数据驱动地展示 agent 的多步任务清单（每步带状态、描述、耗时）。单次工具调用用 [ToolCall](../tool-call/tool-call.md)，自由文本推理用 [ThinkingBlock](../thinking-block/thinking-block.md)；这里是结构化的步骤进度。

## 导入
```ts
import { AgentPlan } from "@hulianui/ui"
```

## Props

`AgentPlanProps`：

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| tasks * | `AgentTask[]` | - | 任务清单（数据驱动） |
| bare | `boolean` | `false` | 去掉外层边框/底色/内边距，仅渲染列表，供内嵌复用（如 TaskRunner） |
| strikeDone | `boolean` | `true` | done 任务是否加删除线：计划清单语义=true；执行日志语义=false 保留实色 |
| className | `string` | - | 容器类名 |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| title | `ReactNode` | 头部标题（默认 `"执行计划"`）；传 null 隐藏 |

`AgentTask`：

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| title | `ReactNode` | - | 任务标题 |
| status | `"pending" ｜ "running" ｜ "done" ｜ "error"` | `"pending"` | pending 待办(空心环) / running 进行中(转圈·行高亮) / done 完成(勾·删除线) / error 失败(叉) |
| detail | `ReactNode` | - | 次要描述（标题下方弱化） |
| meta | `ReactNode` | - | 行右侧 trailing 槽（右对齐弱化）：放耗时(如 180ms)/小标记 |

## 示例
```tsx
<AgentPlan
  tasks={[
    { title: "读取现有 page.tsx", status: "done", detail: "仅用了 Button" },
    { title: "逐块替换为 @hulianui/ui", status: "running" },
    { title: "截图验证明暗双主题", status: "pending" },
  ]}
/>
```

## 禁忌 / 坑

- `tasks` 是必填的纯数据数组，组件本身不维护状态——进度推进靠消费侧更新数组重渲染。
- 内嵌到别的卡片（如 TaskRunner）里时传 `bare` 去掉外层边框底色；执行日志语义下传 `strikeDone={false}` 避免完成项加删除线。

## 相关
[ThinkingBlock](../thinking-block/thinking-block.md) · [ToolCall](../tool-call/tool-call.md) · [Dossier](../dossier/dossier.md) · [Artifact](../artifact/artifact.md) · [ConfirmCard](../confirm-card/confirm-card.md) · [ThreadList](../thread-list/thread-list.md)
