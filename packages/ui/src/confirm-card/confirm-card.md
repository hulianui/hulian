---
slug: confirm-card
name: ConfirmCard
category: ai
group: agent
tags: []
exports: [ConfirmCard]
status: enriched
---

# ConfirmCard

> 确认卡 · human-in-the-loop 标准件：结构化字段摘要(dl) + 确认/修正双动作 + acted 锁定态(已确认/修改中) · dogfood Button · ai/agent

## 何时用

agent 执行高风险动作前需要人工核对结构化字段并确认/修正（human-in-the-loop）时用。区别于 [Artifact](../artifact/artifact.md)（承载产出物内容）与 [Dossier](../dossier/dossier.md)（纯展示案卷），本组件核心是 label/value 字段摘要 + 双动作按钮 + 操作后锁定态。

## 导入
```ts
import { ConfirmCard } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| items* | `ConfirmCardItem[]` | — | 字段摘要数组，每项 `{ label, value }`，渲染为 dl |
| acted | `"confirmed" \| "edited" \| null` | `null` | 已操作结果：锁定双钮并标记所选项 |
| className | `string` | — | 容器附加类 |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onConfirm | `() => void` | 点击确认回调 |
| onEdit | `() => void` | 点击修改回调；**未提供则不渲染修改钮**（单动作场景） |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| title | `ReactNode` | 卡头标题（默认 `"请确认以下信息"`） |
| confirmText | `ReactNode` | 确认按钮文字（默认 `"确认无误"`） |
| editText | `ReactNode` | 修改按钮文字（默认 `"需要修改"`） |

`ConfirmCardItem`：`{ label: ReactNode; value: ReactNode }`

## 示例
```tsx
const [acted, setActed] = useState<"confirmed" | "edited" | null>(null);

<ConfirmCard
  title="案卷摘要 · 请确认"
  items={[
    { label: "基本信息", value: "林晚晴 · 138-0000-0000" },
    { label: "求职意向", value: "云栖科技 · 总裁私人秘书" },
  ]}
  acted={acted}
  onConfirm={() => setActed("confirmed")}
  onEdit={() => setActed("edited")}
/>
```

## 禁忌 / 坑

- 缺省 `onEdit` 时不渲染修改钮（commit daa1e09 修复，避免单动作场景出现点了无反应的死按钮）；想要双动作必须两个回调都传。
- `acted` 是受控锁定态：操作后需由父级 setState 写回 `acted`，否则按钮不会进入锁定/标记态。

## 相关
[ThinkingBlock](../thinking-block/thinking-block.md) · [ToolCall](../tool-call/tool-call.md) · [AgentPlan](../agent-plan/agent-plan.md) · [Dossier](../dossier/dossier.md) · [Artifact](../artifact/artifact.md) · [ThreadList](../thread-list/thread-list.md)
