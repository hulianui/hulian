---
slug: task-runner
name: TaskRunner
category: ai
group: agent
tags: []
exports: [TaskRunner, resolveProgress, statusMeta]
status: enriched
---

# TaskRunner

> 汇总一次任务运行的状态、步骤、进度和耗时 · ai/agent

## 何时用

展示一组按序执行的任务步骤及整体运行状态（沙箱启动、部署流水线等），需要顶部进度条、每步耗时、running 高亮、累计耗时页脚时用。区别于 [AgentPlan](../agent-plan/agent-plan.md)（纯计划/勾选清单），本组件多了运行态徽标 + 进度 + 计时框架。本组件是纯展示 RSC，计时/状态推进逻辑留在消费侧。

## 导入
```ts
import { TaskRunner, resolveProgress, statusMeta } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| steps* | `AgentTask[]` | - | 步骤清单（复用 AgentTask：title/status/detail/meta，耗时放 meta） |
| status | `"idle" \| "running" \| "success" \| "error"` | `"idle"` | 整体运行状态：驱动头部徽标色 + 进度条 tone |
| progress | `number` | - | 顶部进度 0-100；省略则按 steps 完成(done)比自动派生 |
| className | `string` | - | 容器附加类 |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| title* | `ReactNode` | 卡头标题（如 `"Sandbox"`） |
| tag | `ReactNode` | 标题旁标签（如 `"node26"`），渲染为浅底 Tag |
| statusLabel | `ReactNode` | 头部徽标文字覆盖；省略时按 status 派生（Idle/Running/Done/Failed） |
| elapsed | `ReactNode` | 底部左侧累计耗时（如 `"3.12s"`） |
| footerStatus | `ReactNode` | 底部右侧状态文字；footerExtra 存在时被其替换 |
| headerExtra | `ReactNode` | 头部右侧追加（按钮/菜单等） |
| footerExtra | `ReactNode` | 替换底部右侧内容 |

`AgentTask` 步骤项 `status`：`"done"`（已完成，meta 显耗时）/ `"running"`（高亮）/ `"pending"`（空心环）/ `"error"`。

## 示例
```tsx
const SANDBOX_STEPS: AgentTask[] = [
  { title: "Allocate microVM", status: "done", meta: "180ms" },
  { title: "Boot runtime · Node 26", status: "done", meta: "1082ms" },
  { title: "Execute main.js", status: "running", meta: "…" },
  { title: "Reclaim sandbox", status: "pending" },
];

<TaskRunner
  title="Sandbox"
  tag="node26"
  status="running"
  steps={SANDBOX_STEPS}
  progress={58}
  elapsed="3.12s"
  footerStatus="Executing…"
/>
```

## 禁忌 / 坑

- 纯展示组件：不自带计时器/步骤推进。运行驱动（setInterval 推进 status、累计 elapsed）放消费侧，把派生出的 steps/status/elapsed 喂进来。
- `progress` 省略时按 steps 中 done 占比自动派生；想要平滑的非整步进度（如 58%）须显式传 `progress`。
- `footerExtra` 会覆盖 `footerStatus`，二者不要指望同时显示。
- 暂无其它已知坑。

## 相关
[ThinkingBlock](../thinking-block/thinking-block.md) · [ToolCall](../tool-call/tool-call.md) · [AgentPlan](../agent-plan/agent-plan.md) · [Dossier](../dossier/dossier.md) · [Artifact](../artifact/artifact.md) · [ConfirmCard](../confirm-card/confirm-card.md)
