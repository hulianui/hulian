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

> Conversation history list · ChatGPT-style agent sidebar with two-line title and metadata, active highlighting, a delete button that does not trigger selection, a header action slot for new conversations, an empty state, and a bare inline variant · ai/agent

## When to Use

Used for the session history list (title + relative time double line, active highlighting, deletion) in the agent sidebar. This component manages "switching/deleting historical conversations", not the message flow itself; the operation bar of a single message uses [MessageActions](../message-actions/message-actions.md). Pass `bare` when you need to remove the border and embed your own sidebar layout.

## Import
```ts
import { ThreadList } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| items* | `ThreadListItem[]` | — | array of session entries |
| bare | `boolean` | `false` | Remove the container border background and use it inline |
| className | `string` | — | Container additional class |

## Events

| Event | Type | Description |
|------|------|------|
| onSelect | `(id: string) => void` | Click entry callback |
| onDelete | `(id: string) => void` | Provide a delete button for each rendering (click stopPropagation, onSelect will not be triggered) |

## Slots

| Slot | Type | Description |
|------|------|------|
| title | `ReactNode` | Header title (default `"\u5386\u53f2"` ("History")) |
| action | `ReactNode` | Action slot on the right side of the head (such as the "New Conversation" button) |
| empty | `ReactNode` | Placeholder when items is empty (default `"\u6682\u65e0\u5386\u53f2"` ("No history")) |

`ThreadListItem`: `{ id: string; title: ReactNode; meta?: ReactNode; active?: boolean }` (meta is sub-line information, active indicates the currently open session)

## Examples
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
      New conversation
    </Button>
  }
/>
```

## Usage Guidelines

- `active` highlighting is driven by the `active` field on the item and is not maintained internally by the component - the parent needs to calculate and write based on activeId during map.
- The delete button is only rendered when `onDelete` is passed; its click has built-in stopPropagation and will not trigger onSelect.
- The delete button uses the built-in Chinese accessible label `\u5220\u9664\u4f1a\u8bdd` ("Delete conversation").

## Related
[ThinkingBlock](../thinking-block/thinking-block.md) · [ToolCall](../tool-call/tool-call.md) · [AgentPlan](../agent-plan/agent-plan.md) · [Dossier](../dossier/dossier.md) · [Artifact](../artifact/artifact.md) · [ConfirmCard](../confirm-card/confirm-card.md)
