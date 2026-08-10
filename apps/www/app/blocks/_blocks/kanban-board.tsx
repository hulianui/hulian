/** @jsxImportSource ../../../lib/fixture-jsx */
"use client";

// 多列看板区块 —— 待处理/进行中/已完成/已归档四列，列内任务卡
// （标题 + 优先级 Tag + 负责人 Avatar），支持跨列拖拽（键盘亦可）。
// 受控 state + KanbanMoveEvent 手动更新，数据全内联。

import { useState } from "react";
import {
  Avatar,
  Kanban,
  type KanbanColumn,
  type KanbanMoveEvent,
  Tag,
  Text,
  toast,
} from "../../../lib/fixture-ui";

type Column = "待处理" | "进行中" | "已完成" | "已归档";
type Priority = "紧急" | "高" | "中" | "低";

interface Task {
  id: string;
  title: string;
  priority: Priority;
  assignee: string;
  column: Column;
  dueAt?: string;
}

const PRIORITY_TONE: Record<Priority, "danger" | "warning" | "brand" | "neutral"> = {
  紧急: "danger",
  高: "warning",
  中: "brand",
  低: "neutral",
};

const COLUMNS: KanbanColumn[] = [
  { id: "待处理", title: "待处理" },
  { id: "进行中", title: "进行中" },
  { id: "已完成", title: "已完成" },
  { id: "已归档", title: "已归档" },
];

const COLUMN_ACCENT: Record<Column, string> = {
  待处理: "bg-neutral/30",
  进行中: "bg-brand/20",
  已完成: "bg-success/20",
  已归档: "bg-muted-foreground/20",
};

const SEED_TASKS: Task[] = [
  { id: "T-01", title: "修复生产环境 OOM 崩溃", priority: "紧急", assignee: "王磊", column: "进行中", dueAt: "06-06" },
  { id: "T-02", title: "数据库慢查询优化", priority: "高", assignee: "李思远", column: "待处理", dueAt: "06-08" },
  { id: "T-03", title: "前端首屏性能 LCP 达标", priority: "高", assignee: "王雪梅", column: "进行中", dueAt: "06-10" },
  { id: "T-04", title: "用户行为埋点接入", priority: "中", assignee: "陈建国", column: "待处理", dueAt: "06-12" },
  { id: "T-05", title: "API 文档自动生成脚本", priority: "低", assignee: "刘芳", column: "已完成" },
  { id: "T-06", title: "CI/CD 平均构建时间压缩至 3min", priority: "中", assignee: "赵磊", column: "进行中", dueAt: "06-09" },
  { id: "T-07", title: "邮件通知模板国际化", priority: "低", assignee: "周晨", column: "已归档" },
  { id: "T-08", title: "登录流程 A/B 测试分析报告", priority: "中", assignee: "吴凯", column: "已完成" },
  { id: "T-09", title: "移动端暗色模式适配", priority: "低", assignee: "孙丽", column: "待处理", dueAt: "06-15" },
  { id: "T-10", title: "安全扫描集成 CI 门禁", priority: "高", assignee: "张晓明", column: "待处理", dueAt: "06-07" },
];

/** 把拖拽事件映射回受控数组（改 column + 按 toIndex 插入目标列）。 */
function applyMove(all: Task[], current: Task[], e: KanbanMoveEvent): Task[] {
  const moving = all.find((t) => t.id === e.id);
  if (!moving) return all;
  const updated: Task = { ...moving, column: e.toColumn as Column };
  const without = all.filter((t) => t.id !== e.id);
  const anchor = current.filter((t) => t.column === e.toColumn && t.id !== e.id)[e.toIndex];
  if (!anchor) return [...without, updated];
  const at = without.findIndex((t) => t.id === anchor.id);
  return [...without.slice(0, at), updated, ...without.slice(at)];
}

function TaskCard({ task, dragging }: { task: Task; dragging: boolean }) {
  return (
    <div
      className={`rounded-[var(--radius)] border border-border bg-surface p-3 shadow-sm transition-all ${dragging ? "shadow-lg ring-1 ring-primary/40" : "hover:shadow-md"}`}
    >
      <div className="mb-2 text-sm font-medium leading-snug text-foreground">{task.title}</div>
      <div className="flex items-center justify-between gap-2">
        <Tag tone={PRIORITY_TONE[task.priority]} size="sm" variant="soft">
          {task.priority}
        </Tag>
        <div className="flex items-center gap-1.5">
          {task.dueAt && (
            <Text size="xs" tone="muted" className="tabular-nums">
              {task.dueAt}
            </Text>
          )}
          <Avatar fallback={task.assignee.slice(0, 1)} size="sm" />
        </div>
      </div>
    </div>
  );
}

export function KanbanBoardBlock() {
  const [tasks, setTasks] = useState<Task[]>(SEED_TASKS);

  const handleMove = (e: KanbanMoveEvent) => {
    setTasks((prev) => {
      if (e.fromColumn !== e.toColumn) {
        const t = prev.find((x) => x.id === e.id);
        if (t) toast({ title: "任务已移动", description: `${t.title} → ${e.toColumn}`, tone: "info" });
      }
      return applyMove(prev, prev, e);
    });
  };

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-base font-semibold text-foreground">任务看板</span>
        <Text size="sm" tone="muted">
          {tasks.length} 个任务 · 拖拽卡片跨列移动
        </Text>
      </div>
      <div className="overflow-x-auto pb-1">
        <Kanban<Task>
          columns={COLUMNS}
          items={tasks}
          getId={(t) => t.id}
          getColumnId={(t) => t.column}
          onMove={handleMove}
          columnClassName="min-w-[220px]"
          renderColumnHeader={(col, its) => (
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`size-2 rounded-full ${COLUMN_ACCENT[col.id as Column]}`} aria-hidden />
                <span className="text-sm font-semibold text-foreground">{col.title}</span>
              </div>
              <Tag tone="neutral" size="sm" variant="soft">
                {its.length}
              </Tag>
            </div>
          )}
          renderItem={(task, { dragging }) => <TaskCard task={task} dragging={dragging} />}
        />
      </div>
    </div>
  );
}
