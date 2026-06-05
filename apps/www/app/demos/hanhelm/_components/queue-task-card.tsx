"use client";
import { Tag } from "@hulian/ui";
import type { Task } from "../_data/types";
import { executorName } from "../_data/executors";
import {
  CapabilityTags,
  SLA_META,
  STATUS_META,
  fmtDuration,
  fmtSlaMargin,
  taskSla,
} from "./queue-shared";

/** 泳道板内的单个任务卡（只读，点击下钻详情）。 */
export function QueueTaskCard({ task, index }: { task: Task; index: number }) {
  const sla = taskSla(task);
  const slaMeta = SLA_META[sla.status];
  const status = STATUS_META[task.status];

  return (
    <div className="rounded-[var(--radius)] border border-border bg-background px-3 py-2.5 transition-colors hover:border-primary/40">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate text-[13px] font-medium text-foreground">{task.title}</div>
          <div className="mt-0.5 text-[11px] text-muted">{task.type}</div>
        </div>
        {/* 队列位次（0 = 队首 FIFO） */}
        <span className="shrink-0 rounded-full bg-muted px-1.5 text-[11px] tabular-nums text-muted">
          #{index + 1}
        </span>
      </div>

      <div className="mt-1.5">
        <CapabilityTags capabilities={task.capabilities} max={3} />
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <Tag tone={slaMeta.tone} size="sm" dot>
          SLA {slaMeta.label}
        </Tag>
        <Tag tone={status.tone} size="sm" variant="soft">
          {status.label}
        </Tag>
      </div>

      <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-muted">
        <span className="truncate">{executorName(task.assignedExecutorId)}</span>
        <span className="shrink-0 tabular-nums">{fmtSlaMargin(sla.marginMs)}</span>
      </div>
      <div className="mt-0.5 text-[11px] tabular-nums text-muted">
        已等待 {fmtDuration(task.waitedMs)}
      </div>
    </div>
  );
}
