"use client";
import { useState } from "react";
import { Avatar, Kanban, type KanbanColumn, type KanbanMoveEvent, Tag, Text, toast, } from "@hulianui/ui";
type Column = "Pending" | "In progress" | "Completed" | "Archived";
type Priority = "urgent" | "High" | "Medium" | "Low";
interface Task {
    id: string;
    title: string;
    priority: Priority;
    assignee: string;
    column: Column;
    dueAt?: string;
}
const PRIORITY_TONE: Record<Priority, "danger" | "warning" | "brand" | "neutral"> = {
    "urgent": "danger",
    "High": "warning",
    "Medium": "brand",
    "Low": "neutral",
};
const COLUMNS: KanbanColumn[] = [
    { id: "Pending", title: "Pending" },
    { id: "In progress", title: "In progress" },
    { id: "Completed", title: "Completed" },
    { id: "Archived", title: "Archived" },
];
const COLUMN_ACCENT: Record<Column, string> = {
    "Pending": "bg-neutral/30",
    "In progress": "bg-brand/20",
    "Completed": "bg-success/20",
    "Archived": "bg-muted/20",
};
const SEED_TASKS: Task[] = [
    { id: "T-01", title: "Fix production OOM crash", priority: "urgent", assignee: "Wang Lei", column: "In progress", dueAt: "06-06" },
    { id: "T-02", title: "Database slow query optimization", priority: "High", assignee: "Li Siyuan", column: "Pending", dueAt: "06-08" },
    { id: "T-03", title: "Meet the LCP target for initial page load", priority: "High", assignee: "Wang Xuemei", column: "In progress", dueAt: "06-10" },
    { id: "T-04", title: "Add product analytics tracking", priority: "Medium", assignee: "Chen Jianguo", column: "Pending", dueAt: "06-12" },
    { id: "T-05", title: "Generate API documentation automatically", priority: "Low", assignee: "Liu Fang", column: "Completed" },
    { id: "T-06", title: "CI/CD average build time reduced to 3 minutes", priority: "Medium", assignee: "Zhao Lei", column: "In progress", dueAt: "06-09" },
    { id: "T-07", title: "Email notification template internationalization", priority: "Low", assignee: "Zhou Chen", column: "Archived" },
    { id: "T-08", title: "Login Flow A/B Test Analysis Report", priority: "Medium", assignee: "Wu Kai", column: "Completed" },
    { id: "T-09", title: "Support dark mode on mobile", priority: "Low", assignee: "Sun Li", column: "Pending", dueAt: "06-15" },
    { id: "T-10", title: "Security scanning built into CI gates", priority: "High", assignee: "Zhang Xiaoming", column: "Pending", dueAt: "06-07" },
];
function applyMove(all: Task[], current: Task[], e: KanbanMoveEvent): Task[] {
    const moving = all.find((t) => t.id === e.id);
    if (!moving)
        return all;
    const updated: Task = { ...moving, column: e.toColumn as Column };
    const without = all.filter((t) => t.id !== e.id);
    const anchor = current.filter((t) => t.column === e.toColumn && t.id !== e.id)[e.toIndex];
    if (!anchor)
        return [...without, updated];
    const at = without.findIndex((t) => t.id === anchor.id);
    return [...without.slice(0, at), updated, ...without.slice(at)];
}
function TaskCard({ task, dragging }: {
    task: Task;
    dragging: boolean;
}) {
    return (<div className={`rounded-[var(--radius)] border border-border bg-surface p-3 shadow-sm transition-all ${dragging ? "shadow-lg ring-1 ring-primary/40" : "hover:shadow-md"}`}>
      <div className="mb-2 text-sm font-medium leading-snug text-foreground">{task.title}</div>
      <div className="flex items-center justify-between gap-2">
        <Tag tone={PRIORITY_TONE[task.priority]} size="sm" variant="soft">
          {task.priority}
        </Tag>
        <div className="flex items-center gap-1.5">
          {task.dueAt && (<Text size="xs" tone="muted" className="tabular-nums">
              {task.dueAt}
            </Text>)}
          <Avatar fallback={task.assignee.slice(0, 1)} size="sm"/>
        </div>
      </div>
    </div>);
}
export function KanbanBoardBlock() {
    const [tasks, setTasks] = useState<Task[]>(SEED_TASKS);
    const handleMove = (e: KanbanMoveEvent) => {
        setTasks((prev) => {
            if (e.fromColumn !== e.toColumn) {
                const t = prev.find((x) => x.id === e.id);
                if (t)
                    toast({ title: "Task moved", description: `${t.title} \u2192 ${e.toColumn}`, tone: "info" });
            }
            return applyMove(prev, prev, e);
        });
    };
    return (<div className="mx-auto w-full max-w-6xl">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-base font-semibold text-foreground">Task board</span>
        <Text size="sm" tone="muted">
          {tasks.length} tasks · Drag cards between columns
        </Text>
      </div>
      <div className="overflow-x-auto pb-1">
        <Kanban<Task> columns={COLUMNS} items={tasks} getId={(t) => t.id} getColumnId={(t) => t.column} onMove={handleMove} columnClassName="min-w-[220px]" renderColumnHeader={(col, its) => (<div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`size-2 rounded-full ${COLUMN_ACCENT[col.id as Column]}`} aria-hidden/>
                <span className="text-sm font-semibold text-foreground">{col.title}</span>
              </div>
              <Tag tone="neutral" size="sm" variant="soft">
                {its.length}
              </Tag>
            </div>)} renderItem={(task, { dragging }) => <TaskCard task={task} dragging={dragging}/>}/>
      </div>
    </div>);
}
