---
slug: dossier
name: Dossier
category: ai
group: agent
tags: []
exports: [Dossier]
status: enriched
---

# Dossier

> 展示智能体各信息域的收集进度和内容摘要 · ai/agent

## 何时用

可视化 agent 按域（slot）逐步采集信息的案卷填充进度：每个域有空/部分/完成三态、当前域高亮、自动算「已归档 n/m」。线性任务步骤用 [AgentPlan](../agent-plan/agent-plan.md)；这里是分域槽位填充（如访谈逐项收集）。

## 导入
```ts
import { Dossier } from "@hulianui/ui"
```

## Props

`DossierProps`：

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| sections * | `DossierSection[]` | - | 分域清单（数据驱动） |
| bare | `boolean` | `false` | 去掉容器边框背景，内嵌用 |
| className | `string` | - | 容器类名 |
| archivedLabel | `ReactNode` | 取自 locale | 自动进度前缀。服务端渲染场景可显式传入本地化文案 |
| optionalLabel | `ReactNode` | 取自 locale | 可选域标记。服务端渲染场景可显式传入本地化文案 |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| title | `ReactNode` | 头部标题（默认 `"案卷"`） |
| progress | `ReactNode` | 头部右侧进度文案，缺省自动算「已归档 n/m」（m 不含 optional 域） |

`DossierSection`：

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| key * | `string` | - | 域唯一标识 |
| label * | `ReactNode` | - | 域名称 |
| status | `"empty" ｜ "partial" ｜ "done"` | `"empty"` | 空(空心环) / 半填充 / 完成(勾) |
| optional | `boolean` | `false` | 可选域：不计入进度分母，empty 时弱化并标注「可选」 |
| summary | `ReactNode` | - | 已归档内容摘要（一两行） |
| active | `boolean` | `false` | 当前正在采集的域，高亮 |

## 示例
```tsx
<Dossier
  sections={[
    { key: "basic", label: "基本信息", status: "done", summary: "林晚晴 · 138-0000-0000" },
    { key: "education", label: "教育背景", status: "partial", active: true, summary: "待补专业理由" },
    { key: "experience", label: "工作经历", status: "empty" },
    { key: "extras", label: "可选补充", status: "empty", optional: true },
  ]}
/>
```

## 禁忌 / 坑

- 自动进度分母不含 `optional` 域；想让某域参与计数就别标 optional。
- `sections` 纯数据驱动，进度推进靠消费侧更新数组重渲染；内嵌别的卡片里时传 `bare`。

## 相关
[ThinkingBlock](../thinking-block/thinking-block.md) · [ToolCall](../tool-call/tool-call.md) · [AgentPlan](../agent-plan/agent-plan.md) · [Artifact](../artifact/artifact.md) · [ConfirmCard](../confirm-card/confirm-card.md) · [ThreadList](../thread-list/thread-list.md)
