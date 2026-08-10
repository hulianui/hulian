"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { Kanban } from "./kanban";
import type { KanbanColumn, KanbanMoveEvent } from "./kanban.types";
import { Tag } from "../tag";

interface Card {
  id: string;
  title: string;
  owner: string;
  status: string;
}

const COLUMNS: KanbanColumn[] = [
  { id: "backlog", title: "待规划" },
  { id: "todo", title: "待开发" },
  { id: "doing", title: "进行中" },
  { id: "done", title: "已完成" },
];

const INITIAL: Card[] = [
  { id: "k1", title: "登录页改版", owner: "林晚晴", status: "backlog" },
  { id: "k2", title: "客户列表筛选", owner: "周明远", status: "todo" },
  { id: "k3", title: "商机看板拖拽", owner: "高敏", status: "doing" },
  { id: "k4", title: "订单详情抽屉", owner: "陈策", status: "todo" },
  { id: "k5", title: "工作台图表", owner: "苏晓", status: "done" },
];

/** 把 onMove 事件落到受控数组：改 status + 按 toIndex 插回目标列。 */
function applyMove(items: Card[], e: KanbanMoveEvent): Card[] {
  const moving = items.find((i) => i.id === e.id);
  if (!moving) return items;
  const without = items.filter((i) => i.id !== e.id);
  const updated = { ...moving, status: e.toColumn };
  const targetCards = without.filter((i) => i.status === e.toColumn);
  const anchor = targetCards[e.toIndex];
  if (!anchor) return [...without, updated];
  const at = without.findIndex((i) => i.id === anchor.id);
  return [...without.slice(0, at), updated, ...without.slice(at)];
}

function BoardDemo() {
  const [cards, setCards] = useState(INITIAL);
  return (
    <Kanban
      items={cards}
      columns={COLUMNS}
      getId={(c) => c.id}
      getColumnId={(c) => c.status}
      onMove={(e) => setCards((prev) => applyMove(prev, e))}
      renderColumnHeader={(col, its) => (
        <div className="mb-1 flex items-center justify-between">
          <span className="text-sm font-semibold text-foreground">{col.title}</span>
          <Tag tone="neutral" size="sm">
            {its.length}
          </Tag>
        </div>
      )}
      renderItem={(c) => (
        <div className="rounded-[var(--radius)] border border-hairline bg-surface p-3 shadow-sm">
          <p className="text-sm font-medium text-foreground">{c.title}</p>
          <p className="mt-1 text-xs text-muted-foreground">{c.owner}</p>
        </div>
      )}
    />
  );
}

/** 只读看板：不传 onMove 的对账逻辑、只展示分桶（这里仍传空 onMove 满足必填，但卡片不会改列）。 */
function ReadOnlyBoard() {
  return (
    <Kanban
      items={INITIAL}
      columns={COLUMNS}
      getId={(c) => c.id}
      getColumnId={(c) => c.status}
      onMove={() => {}}
      renderItem={(c) => (
        <div className="rounded-[var(--radius)] border border-hairline bg-surface p-3 shadow-sm">
          <p className="text-sm font-medium text-foreground">{c.title}</p>
          <p className="mt-1 text-xs text-muted-foreground">{c.owner}</p>
        </div>
      )}
    />
  );
}

export const kanbanShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description:
        "受控 items + columns 分桶展示。getId 取稳定主键，getColumnId 取卡片当前所属列。",
      code: `<Kanban
  items={cards}
  columns={[
    { id: "backlog", title: "待规划" },
    { id: "todo", title: "待开发" },
    { id: "doing", title: "进行中" },
    { id: "done", title: "已完成" },
  ]}
  getId={(c) => c.id}
  getColumnId={(c) => c.status}
  onMove={() => {}}
  renderItem={(c) => (
    <div className="rounded-[var(--radius)] border border-hairline bg-surface p-3 shadow-sm">
      <p className="text-sm font-medium text-foreground">{c.title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{c.owner}</p>
    </div>
  )}
/>`,
      render: () => <ReadOnlyBoard />,
    },
    {
      title: "跨列拖拽（受控对账）",
      description:
        "组件不直接改业务字段，只回吐 onMove；消费者据此改 status 并按 toIndex 插回目标列。支持指针与键盘（聚焦卡片 Space 抓起 / 方向键移动 / Space 放下）。",
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
      title: "自定义列头统计",
      description:
        "renderColumnHeader 拿到该列卡片，可做条数 / 进度等聚合。",
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
  states: [{ name: "看板 · 跨列拖拽（指针 / 键盘：聚焦卡片 Space 抓起 · 方向键移动 · Space 放下）", render: () => <BoardDemo /> }],
  renderWithProps: () => <BoardDemo />,
  toCode: () =>
    [
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
