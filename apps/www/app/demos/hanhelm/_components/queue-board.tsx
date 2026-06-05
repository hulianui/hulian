"use client";
import { useRouter } from "next/navigation";
import { QueueLane, Tag } from "@hulian/ui";
import type { QueueLaneDef, QueueItem } from "@hulian/ui";
import type { Priority, Task } from "../_data/types";
import { ROOT } from "./nav-config";
import { PRIORITY_TONE, fmtDuration } from "./queue-shared";
import { QueueTaskCard } from "./queue-task-card";

const PRIORITIES: Priority[] = ["P0", "P1", "P2", "P3"];

const PRIORITY_LABEL: Record<Priority, string> = {
  P0: "P0 紧急",
  P1: "P1 高",
  P2: "P2 普通",
  P3: "P3 低",
};

/** QueueLane 的队列项：扁平复制 Task 关键字段 + laneId（=优先级）。 */
interface LaneTask extends QueueItem {
  task: Task;
}

const LANES: QueueLaneDef[] = PRIORITIES.map((p) => ({
  id: p,
  label: PRIORITY_LABEL[p],
  tone: PRIORITY_TONE[p],
}));

export function QueueBoard({ tasks }: { tasks: Task[] }) {
  const router = useRouter();

  const items: LaneTask[] = tasks.map((t) => ({ id: t.id, laneId: t.priority, task: t }));

  return (
    <QueueLane<LaneTask>
      lanes={LANES}
      items={items}
      maxVisible={5}
      onItemClick={(it) => router.push(`${ROOT}/queue/${it.task.id}`)}
      renderItem={(it, index) => <QueueTaskCard task={it.task} index={index} />}
      renderLaneHeader={(lane, laneItems) => {
        // 道头聚合：队列深度（条数）+ 平均等待 + 在途状态。
        const depth = laneItems.length;
        const avgWait =
          depth === 0
            ? 0
            : Math.round(laneItems.reduce((s, it) => s + it.task.waitedMs, 0) / depth);
        const running = laneItems.filter((it) => it.task.status === "running").length;
        return (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-foreground">{lane.label}</span>
              <Tag tone="neutral" size="sm">
                深度 {depth}
              </Tag>
            </div>
            <div className="flex items-center gap-3 text-[11px] tabular-nums text-muted">
              <span>均等 {depth === 0 ? "—" : fmtDuration(avgWait)}</span>
              <span>在途 {running}</span>
            </div>
          </div>
        );
      }}
    />
  );
}
