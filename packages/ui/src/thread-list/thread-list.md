---
slug: thread-list
name: ThreadList
category: ai
group: agent
tags: []
exports: [ThreadList]
status: enriched
---

# ThreadList

> 会话历史列表 · ChatGPT 式智能体侧栏：标题+meta 双行条目 + active 高亮 + 删除按钮(stopPropagation 不触发选中) + 头部动作槽(新对话) + 空态占位 + bare 内嵌 · ai/agent

## 何时用

智能体侧栏的会话历史列表（标题+相对时间双行、active 高亮、删除）时用。本组件管的是「切换/删除历史会话」，不是消息流本身；单条消息的操作条用 [MessageActions](../message-actions/message-actions.md)。需要去边框内嵌进自有侧栏布局时传 `bare`。

## 导入
```ts
import { ThreadList } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| items* | `ThreadListItem[]` | — | 会话条目数组 |
| bare | `boolean` | `false` | 去掉容器边框背景，内嵌用 |
| className | `string` | — | 容器附加类 |

`ThreadListItem`

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| id * | `string` | — | 唯一键，也是 `onSelect` 的入参 |
| title * | `ReactNode` | — | 会话标题 |
| meta | `ReactNode` | — | 次行元信息（相对时间 / 摘要） |
| active | `boolean` | `false` | 当前打开的会话，高亮 |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onSelect | `(id: string) => void` | 点击条目回调 |
| onDelete | `(id: string) => void` | 提供则每项渲染删除按钮（点击 stopPropagation，不触发 onSelect） |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| title | `ReactNode` | 头部标题（默认 `"历史"`） |
| action | `ReactNode` | 头部右侧动作槽（如「新对话」按钮） |
| empty | `ReactNode` | items 为空时的占位（默认 `"暂无历史"`） |

`ThreadListItem`：`{ id: string; title: ReactNode; meta?: ReactNode; active?: boolean }`（meta 为次行元信息，active 标当前打开会话）

## 示例
```tsx
const [items, setItems] = useState(seed);
const [activeId, setActiveId] = useState("a");

<ThreadList
  items={items.map((it) => ({ ...it, active: it.id === activeId }))}
  onSelect={setActiveId}
  onDelete={(id) => setItems((cur) => cur.filter((it) => it.id !== id))}
  action={
    <Button size="sm" variant="ghost">
      <Plus className="size-3.5" aria-hidden />
      新对话
    </Button>
  }
/>
```

## 禁忌 / 坑

- `active` 高亮由 item 上的 `active` 字段驱动，不是组件内部维护——需父级在 map 时按 activeId 计算写入。
- 删除钮仅在传了 `onDelete` 时渲染；其点击已内置 stopPropagation，不会顺带触发 onSelect。
- 暂无其它已知坑。

## 相关
[ThinkingBlock](../thinking-block/thinking-block.md) · [ToolCall](../tool-call/tool-call.md) · [AgentPlan](../agent-plan/agent-plan.md) · [Dossier](../dossier/dossier.md) · [Artifact](../artifact/artifact.md) · [ConfirmCard](../confirm-card/confirm-card.md)
