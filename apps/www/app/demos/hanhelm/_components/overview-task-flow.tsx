"use client";
// 调度总览 · 最近任务流：精简任务条，点击跳详情；失败/临期红色高亮。
import { useRouter } from "next/navigation";
import { StatusDot, Tag } from "@hulianui/ui";
import type { Priority, Task, TaskStatus } from "../_data/types";
import { executorName } from "../_data/executors";
import { ROOT } from "./nav-config";

const PRIORITY_TONE: Record<Priority, "danger" | "warning" | "brand" | "neutral"> = {
  P0: "danger",
  P1: "warning",
  P2: "brand",
  P3: "neutral",
};

const STATUS_META: Record<
  TaskStatus,
  { label: string; status: "online" | "degraded" | "offline" | "maintenance" }
> = {
  queued: { label: "排队中", status: "maintenance" },
  running: { label: "执行中", status: "online" },
  done: { label: "已完成", status: "online" },
  failed: { label: "失败", status: "offline" },
  "at-risk": { label: "临期", status: "degraded" },
};

export function OverviewTaskFlow({ tasks }: { tasks: Task[] }) {
  const router = useRouter();
  return (
    <ul className="flex flex-col">
      {tasks.map((t) => {
        const meta = STATUS_META[t.status];
        const danger = t.status === "failed" || t.status === "at-risk";
        return (
          <li key={t.id}>
            <button
              type="button"
              onClick={() => router.push(`${ROOT}/queue/${t.id}`)}
              className={
                "flex w-full items-center gap-3 border-b border-border px-1 py-2.5 text-left transition-colors last:border-0 hover:bg-muted/40" +
                (danger ? " bg-danger/5" : "")
              }
            >
              <Tag size="sm" tone={PRIORITY_TONE[t.priority]} variant="solid">
                {t.priority}
              </Tag>
              <div className="min-w-0 flex-1">
                <div
                  className={
                    "truncate text-sm font-medium " +
                    (danger ? "text-danger" : "text-foreground")
                  }
                >
                  {t.title}
                </div>
                <div className="truncate text-xs text-muted">
                  {t.type} · 派给 {executorName(t.assignedExecutorId)}
                </div>
              </div>
              <StatusDot status={meta.status} label={meta.label} size="sm" />
            </button>
          </li>
        );
      })}
    </ul>
  );
}
