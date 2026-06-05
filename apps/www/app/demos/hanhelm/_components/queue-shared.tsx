"use client";
import type { ReactNode } from "react";
import { Tag } from "@hulian/ui";
import type { TagTone } from "@hulian/ui";
import type { Capability, Priority, TaskStatus } from "../_data/types";
import { evaluateSla, type SlaStatus } from "../_lib/sla";

/** 能力域中文短标。 */
export const CAPABILITY_LABEL: Record<Capability, string> = {
  text: "文本",
  code: "代码",
  image: "图像",
  translate: "翻译",
  rag: "检索增强",
  extract: "结构抽取",
  moderate: "内容审核",
  orchestrate: "多 Agent 编排",
};

/** 优先级泳道配色（token 驱动）。 */
export const PRIORITY_TONE: Record<Priority, string> = {
  P0: "var(--chart-3)",
  P1: "var(--chart-4)",
  P2: "var(--primary)",
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
  queued: { tone: "neutral", label: "排队中" },
  running: { tone: "brand", label: "执行中" },
  done: { tone: "success", label: "已完成" },
  failed: { tone: "danger", label: "失败" },
  "at-risk": { tone: "warning", label: "临期" },
};

/** SLA 状态 → Tag 语义色 + 文案。 */
export const SLA_META: Record<SlaStatus, { tone: TagTone; label: string }> = {
  met: { tone: "success", label: "达标" },
  "at-risk": { tone: "warning", label: "临期" },
  violated: { tone: "danger", label: "违约" },
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
  return marginMs >= 0 ? `余 ${fmtDuration(marginMs)}` : `超 ${fmtDuration(marginMs)}`;
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
