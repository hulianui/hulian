"use client";
import { copy } from "./queue-shared.content";

import type { ReactNode } from "react";
import { Tag } from "@hulianui/ui";
import type { TagTone } from "@hulianui/ui";
import type { Capability, Priority, TaskStatus } from "../_data/types";
import { evaluateSla, type SlaStatus } from "../_lib/sla";

/** 能力域中文短标。 */
export const CAPABILITY_LABEL: Record<Capability, string> = {
  text: copy("text"),
  code: copy("code"),
  image: copy("image"),
  translate: copy("translation"),
  rag: copy("retrievalEnhancement"),
  extract: copy("structuralExtraction"),
  moderate: copy("contentReview"),
  orchestrate: copy("multiAgentOrchestration"),
};

/** 优先级泳道配色（token 驱动）。 */
export const PRIORITY_TONE: Record<Priority, string> = {
  P0: "var(--color-chart-3)",
  P1: "var(--color-chart-4)",
  P2: "var(--color-primary)",
  P3: "var(--muted-foreground)",
};

/** 优先级 Tag 语义色。 */
export const PRIORITY_TAG_TONE: Record<Priority, TagTone> = {
  P0: "danger",
  P1: "warning",
  P2: "brand",
  P3: "neutral",
};

/** 任务状态 Tag 语义色 + 文案。 */
export const STATUS_META: Record<TaskStatus, { tone: TagTone; label: string }> = {
  queued: { tone: "neutral", label: copy("inLine") },
  running: { tone: "brand", label: copy("inExecution") },
  done: { tone: "success", label: copy("completed") },
  failed: { tone: "danger", label: copy("failure") },
  "at-risk": { tone: "warning", label: copy("theAppointedTimeApproached") },
};

/** SLA 状态 → Tag 语义色 + 文案。 */
export const SLA_META: Record<SlaStatus, { tone: TagTone; label: string }> = {
  met: { tone: "success", label: copy("meetsTheStandard") },
  "at-risk": { tone: "warning", label: copy("theAppointedTimeApproached2") },
  violated: { tone: "danger", label: copy("breachOfContract") },
};

/**
 * 估算任务剩余 SLA 余量并评估健康度。
 * 已发生延迟 = elapsedMs（运行中/完成）或 waitedMs（排队中，仍在等待消耗 SLA）。
 */
export function taskSla(task: {
  slaMs: number;
  waitedMs: number;
  elapsedMs?: number;
}) {
  const consumed = task.elapsedMs ?? task.waitedMs;
  return evaluateSla(consumed, task.slaMs);
}

/** 毫秒 → 「Xm Ys」/「Xs」可读串。 */
export function fmtDuration(ms: number): string {
  const abs = Math.abs(ms);
  const totalSec = Math.round(abs / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  const sign = ms < 0 ? "-" : "";
  if (m > 0) return `${sign}${m}m ${s}s`;
  return `${sign}${s}s`;
}

/** SLA 余量展示文案（正=剩余，负=超时）。 */
export function fmtSlaMargin(marginMs: number): string {
  return marginMs >= 0 ? copy("yuValue", fmtDuration(marginMs)) : copy("superValue", fmtDuration(marginMs));
}

/** 能力 Tag 群（最多展示 N 个，超出折叠计数）。 */
export function CapabilityTags({
  capabilities,
  max = 3,
}: {
  capabilities: Capability[];
  max?: number;
}): ReactNode {
  const shown = capabilities.slice(0, max);
  const rest = capabilities.length - shown.length;
  return (
    <span className="inline-flex flex-wrap items-center gap-1">
      {shown.map((c) => (
        <Tag key={c} tone="neutral" size="sm" variant="soft">
          {CAPABILITY_LABEL[c]}
        </Tag>
      ))}
      {rest > 0 && (
        <Tag tone="neutral" size="sm" variant="outline">
          +{rest}
        </Tag>
      )}
    </span>
  );
}
