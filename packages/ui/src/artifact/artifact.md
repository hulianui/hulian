---
slug: artifact
name: Artifact
category: ai
group: agent
tags: []
exports: [Artifact]
status: enriched
---

# Artifact

> 工件卡 · 智能体产出物(文档/简历/代码)对话内承载：头部(图标+标题+版本Chip+操作槽) + 折叠限高+底部渐隐遮罩 + 展开/收起(受控/非受控) · dogfood Chip · ai/agent

## 何时用

承载 agent 生成的成型产出物（文档、简历、代码块），需要标题/版本/导出操作并对长内容折叠限高时用。相关里 [Dossier](../dossier/dossier.md) 偏多字段案卷展示；纯文本流式增长用 [StreamingText](../streaming-text/streaming-text.md)；本组件是「最终成品」的容器卡，强调头部元信息 + 限高折叠。

## 导入
```ts
import { Artifact } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| collapsedHeight | `number` | `240` | 折叠态内容限高 px；`<=0` 表示不折叠 |
| defaultExpanded | `boolean` | `false` | 非受控初始展开态 |
| expanded | `boolean` | — | 受控展开态（与 onExpandedChange 配对） |
| className | `string` | — | 容器附加类 |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onExpandedChange | `(expanded: boolean) => void` | 受控展开态变化回调 |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| title* | `ReactNode` | 头部标题 |
| icon | `ReactNode` | 标题前图标 |
| version | `ReactNode` | 版本标识，渲染为小 chip（如 `"v2"`） |
| actions | `ReactNode` | 头部右侧操作区（如导出按钮） |
| expandLabel | `ReactNode` | 折叠时展开按钮文字（默认 `"展开全文"`） |
| collapseLabel | `ReactNode` | 展开时收起按钮文字（默认 `"收起"`） |
| children | `ReactNode` | 工件正文 |

## 示例
```tsx
<Artifact
  title="简历草稿 · 林晚晴"
  icon={<File className="size-4" />}
  version="v2"
  actions={<Button size="sm" variant="ghost">导出</Button>}
>
  {longBody}
</Artifact>

// 不折叠（内容很短时）
<Artifact title="简短产出" collapsedHeight={0}>
  <p className="text-sm">一段不需要折叠的简短内容。</p>
</Artifact>
```

## 禁忌 / 坑

- 受控/非受控二选一：传了 `expanded` 就必须配 `onExpandedChange` 自管状态，否则展开钮点了不动；只想要默认态用 `defaultExpanded`。
- `collapsedHeight<=0` 关闭折叠后不会渲染渐隐遮罩与展开按钮，内容全量铺开——内容很长时别这么设。
- 候选坑 [[release-pipeline-stale-artifact-picked-by-readdir-find]] 讲 CI 发布流水线选错构建产物，与本 UI 工件卡无关，不适用。

## 相关
[ThinkingBlock](../thinking-block/thinking-block.md) · [ToolCall](../tool-call/tool-call.md) · [AgentPlan](../agent-plan/agent-plan.md) · [Dossier](../dossier/dossier.md) · [ConfirmCard](../confirm-card/confirm-card.md) · [ThreadList](../thread-list/thread-list.md)
