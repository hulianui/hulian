"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Kanban } from "../../../../packages/ui/src/kanban/kanban";
import type { KanbanColumn, KanbanMoveEvent } from "../../../../packages/ui/src/kanban/kanban.types";
import { Tag } from "../../../../packages/ui/src/tag";
interface Card {
    id: string;
    title: string;
    owner: string;
    status: string;
}
const COLUMNS: KanbanColumn[] = [
    { id: "backlog", title: "To be planned" },
    { id: "todo", title: "To be developed" },
    { id: "doing", title: "Ongoing" },
    { id: "done", title: "Completed" },
];
const INITIAL: Card[] = [
    { id: "k1", title: "Login page revision", owner: "Lin Wanqing", status: "backlog" },
    { id: "k2", title: "Customer List Filter", owner: "Zhou Mingyuan", status: "todo" },
    { id: "k3", title: "Business Opportunity Board Drag and Drop", owner: "High sensitivity", status: "doing" },
    { id: "k4", title: "Order details drawer", owner: "Chen Ce", status: "todo" },
    { id: "k5", title: "Workbench Diagram", owner: "Su Xiao", status: "done" },
];
function applyMove(items: Card[], e: KanbanMoveEvent): Card[] {
    const moving = items.find((i) => i.id === e.id);
    if (!moving)
        return items;
    const without = items.filter((i) => i.id !== e.id);
    const updated = { ...moving, status: e.toColumn };
    const targetCards = without.filter((i) => i.status === e.toColumn);
    const anchor = targetCards[e.toIndex];
    if (!anchor)
        return [...without, updated];
    const at = without.findIndex((i) => i.id === anchor.id);
    return [...without.slice(0, at), updated, ...without.slice(at)];
}
function BoardDemo() {
    const [cards, setCards] = useState(INITIAL);
    return (<Kanban items={cards} columns={COLUMNS} getId={(c) => c.id} getColumnId={(c) => c.status} onMove={(e) => setCards((prev) => applyMove(prev, e))} renderColumnHeader={(col, its) => (<div className="mb-1 flex items-center justify-between">
          <span className="text-sm font-semibold text-foreground">{col.title}</span>
          <Tag tone="neutral" size="sm">
            {its.length}
          </Tag>
        </div>)} renderItem={(c) => (<div className="rounded-[var(--radius)] border border-border bg-surface p-3 shadow-sm">
          <p className="text-sm font-medium text-foreground">{c.title}</p>
          <p className="mt-1 text-xs text-muted">{c.owner}</p>
        </div>)}/>);
}
function ReadOnlyBoard() {
    return (<Kanban items={INITIAL} columns={COLUMNS} getId={(c) => c.id} getColumnId={(c) => c.status} onMove={() => { }} renderItem={(c) => (<div className="rounded-[var(--radius)] border border-border bg-surface p-3 shadow-sm">
          <p className="text-sm font-medium text-foreground">{c.title}</p>
          <p className="mt-1 text-xs text-muted">{c.owner}</p>
        </div>)}/>);
}
export const kanbanShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Controlled items + columns bucket display. getId takes the stable primary key, and getColumnId takes the column to which the card currently belongs.",
            code: `<Kanban
  items={cards}
  columns={[
    { id: "backlog", title: "To be planned" },
    { id: "todo", title: "To be developed" },
    { id: "doing", title: "In Progress" },
    { id: "done", title: "Completed" },
  ]}
  getId={(c) => c.id}
  getColumnId={(c) => c.status}
  onMove={() => {}}
  renderItem={(c) => (
    <div className="rounded-[var(--radius)] border border-border bg-surface p-3 shadow-sm">
      <p className="text-sm font-medium text-foreground">{c.title}</p>
      <p className="mt-1 text-xs text-muted">{c.owner}</p>
    </div>
  )}
/>`,
            render: () => <ReadOnlyBoard />,
        },
        {
            title: "Drag and drop across columns (controlled reconciliation)",
            description: "The component does not directly change the business field, but only returns onMove; the consumer changes status accordingly and inserts back the target column according to toIndex. Supports pointer and keyboard (focus card Space to grab / arrow keys to move / Space to put down).",
            code: `const [cards, setCards] = useState(INITIAL);

<Kanban
  items={cards}
  columns={columns}
  getId={(c) => c.id}
  getColumnId={(c) => c.status}
  onMove={(e) => setCards((prev) => applyMove(prev, e))}
  renderItem={(c) => <Card title={c.title} owner={c.owner} />}
/>`,
            render: () => <BoardDemo />,
        },
        {
            title: "Custom column header statistics",
            description: "renderColumnHeader After getting this column of cards, you can aggregate the number of items/progress and so on.",
            code: `<Kanban
  items={cards}
  columns={columns}
  getId={(c) => c.id}
  getColumnId={(c) => c.status}
  onMove={(e) => setCards((prev) => applyMove(prev, e))}
  renderColumnHeader={(col, its) => (
    <div className="mb-1 flex items-center justify-between">
      <span className="text-sm font-semibold text-foreground">{col.title}</span>
      <Tag tone="neutral" size="sm">{its.length}</Tag>
    </div>
  )}
  renderItem={(c) => <Card title={c.title} owner={c.owner} />}
/>`,
            render: () => <BoardDemo />,
        },
    ],
    controls: [],
    states: [{ name: "Kanban \u00B7 Drag across columns (Pointer/Keyboard: Focus on card Space Grab \u00B7 Arrow keys to move \u00B7 Space Drop)", render: () => <BoardDemo /> }],
    renderWithProps: () => <BoardDemo />,
    toCode: () => [
        "const [cards, setCards] = useState(initial);",
        "",
        "<Kanban",
        "  items={cards}",
        "  columns={columns}",
        "  getId={(c) => c.id}",
        "  getColumnId={(c) => c.status}",
        "  onMove={(e) => setCards((prev) => applyMove(prev, e))}",
        "  renderItem={(c) => <Card>{c.title}</Card>}",
        "/>",
    ].join("\n"),
};
