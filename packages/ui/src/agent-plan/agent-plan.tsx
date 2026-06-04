import { Check, X } from "../_icons";
import { cn } from "../lib/cn";
import { Dot } from "../dot";
import { Spinner } from "../spinner";
import type { AgentPlanProps, AgentTaskStatus } from "./agent-plan.types";

// Agent 执行计划：数据驱动任务清单 + 状态图标（dogfood Dot/Spinner，Check/X 内联图标）。纯皮肤·RSC。
function StatusIcon({ status }: { status: AgentTaskStatus }) {
  if (status === "running") return <Spinner size="sm" tone="primary" />;
  if (status === "done") return <Check className="size-4 text-success" aria-hidden />;
  if (status === "error") return <X className="size-4 text-danger" aria-hidden />;
  return <Dot tone="neutral" />;
}

export function AgentPlan({ tasks, title = "执行计划", className }: AgentPlanProps) {
  return (
    <div className={cn("rounded-[var(--radius)] border border-border bg-surface p-3", className)}>
      {title && <p className="mb-2.5 text-xs font-medium text-muted">{title}</p>}
      <ol className="space-y-2.5">
        {tasks.map((t, i) => {
          const status = t.status ?? "pending";
          return (
            <li key={i} className="flex items-start gap-2.5 text-sm">
              <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center">
                <StatusIcon status={status} />
              </span>
              <span className="min-w-0">
                <span
                  className={cn(
                    "text-foreground",
                    status === "done" && "text-muted line-through",
                    status === "pending" && "text-muted",
                  )}
                >
                  {t.title}
                </span>
                {t.detail && <span className="mt-0.5 block text-xs text-muted">{t.detail}</span>}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
