import { cn } from "../lib/cn";
import { AgentPlan } from "../agent-plan";
import type { AgentTask } from "../agent-plan";
import { Progress } from "../progress";
import { Tag } from "../tag";
import { Dot } from "../dot";
import type { DotTone } from "../dot";
import type { TaskRunnerProps, TaskRunStatus } from "./task-runner.types";

// 状态派生：Dot 语气色 + Progress tone（Progress 仅 primary|danger）+ 默认徽标文字。
const STATUS_META: Record<
  TaskRunStatus,
  { tone: DotTone; progressTone: "primary" | "danger"; label: string; pulse: boolean }
> = {
  idle: { tone: "neutral", progressTone: "primary", label: "Idle", pulse: false },
  running: { tone: "brand", progressTone: "primary", label: "Running", pulse: true },
  success: { tone: "success", progressTone: "primary", label: "Done", pulse: false },
  error: { tone: "danger", progressTone: "danger", label: "Failed", pulse: false },
};

export function statusMeta(status: TaskRunStatus) {
  return STATUS_META[status];
}

/** 解析顶部进度：显式 progress 优先；否则按 done 步骤比例派生（空步骤→0）。 */
export function resolveProgress(steps: AgentTask[], progress?: number): number {
  if (progress != null) return Math.min(Math.max(progress, 0), 100);
  if (steps.length === 0) return 0;
  const done = steps.filter((s) => s.status === "done").length;
  return Math.round((done / steps.length) * 100);
}

export function TaskRunner({
  title,
  tag,
  status = "idle",
  statusLabel,
  steps,
  progress,
  elapsed,
  footerStatus,
  headerExtra,
  footerExtra,
  className,
}: TaskRunnerProps) {
  const meta = STATUS_META[status];
  const pct = resolveProgress(steps, progress);
  const hasFooter = elapsed != null || footerStatus != null || footerExtra != null;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-[var(--radius-lg,var(--radius))] border border-border bg-surface",
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-4 pt-4">
        <div className="flex min-w-0 items-center gap-2">
          <span className="truncate text-base font-semibold text-foreground">{title}</span>
          {tag != null && (
            <Tag variant="soft" tone="neutral" size="sm">
              {tag}
            </Tag>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2 text-sm font-medium">
          <Dot tone={meta.tone} pulse={meta.pulse} />
          <span className={cn(textToneClass(meta.tone))}>{statusLabel ?? meta.label}</span>
          {headerExtra}
        </div>
      </div>

      {/* 顶部进度条 */}
      <div className="px-4 pb-3 pt-3">
        <Progress variant="linear" tone={meta.progressTone} value={pct} />
      </div>

      {/* 步骤区：dogfood AgentPlan(bare) */}
      <div className="px-4 pb-1">
        <AgentPlan bare strikeDone={false} title={null} tasks={steps} />
      </div>

      {/* Footer */}
      {hasFooter && (
        <div className="mt-1 flex items-center justify-between border-t border-border px-4 py-2.5 text-xs text-muted">
          <span className="tabular-nums">{elapsed}</span>
          <span>{footerExtra ?? footerStatus}</span>
        </div>
      )}
    </div>
  );
}

// 徽标文字色随语气（仅头部状态文字用，Progress/Dot 自带色）。字面 class 供 Tailwind 静态扫描。
function textToneClass(tone: DotTone): string {
  switch (tone) {
    case "brand":
      return "text-primary";
    case "success":
      return "text-success";
    case "warning":
      return "text-warning";
    case "danger":
      return "text-danger";
    default:
      return "text-muted";
  }
}
