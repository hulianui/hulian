import { Check, X } from "../_icons";
import { cn } from "../lib/cn";
import { Spinner } from "../spinner";
import type { AgentPlanProps, AgentTaskStatus } from "./agent-plan.types";

// Agent 执行计划：数据驱动任务清单 + 状态图标（dogfood Spinner，Check/X 内联图标，pending 空心环）。纯皮肤·RSC。
function StatusIcon({ status }: { status: AgentTaskStatus }) {
  if (status === "running") return <Spinner size="sm" tone="primary" />;
  if (status === "done") return <Check className="size-4 text-success" aria-hidden />;
  if (status === "error") return <X className="size-4 text-danger" aria-hidden />;
  // pending：描边空心环（未开始）
  return <span className="size-3.5 rounded-full border-2 border-border" aria-hidden />;
}

export function AgentPlan({
  tasks,
  title = "执行计划",
  bare = false,
  strikeDone = true,
  className,
}: AgentPlanProps) {
  return (
    <div
      className={cn(
        !bare && "rounded-[var(--radius)] border border-border bg-surface p-3",
        className,
      )}
    >
      {title && <p className="mb-2.5 text-xs font-medium text-muted">{title}</p>}
      <ol className="space-y-2.5">
        {tasks.map((t, i) => {
          const status = t.status ?? "pending";
          return (
            <li
              key={i}
              className={cn(
                "flex items-start gap-2.5 text-sm",
                // running 行自动高亮（负 margin 让底色铺满，左缘对齐保持）
                status === "running" && "-mx-2 rounded-lg bg-surface-hover px-2 py-1",
              )}
            >
              <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center">
                <StatusIcon status={status} />
              </span>
              <span className="min-w-0 flex-1">
                <span
                  className={cn(
                    "text-foreground",
                    status === "done" && strikeDone && "text-muted line-through",
                    status === "pending" && "text-muted",
                  )}
                >
                  {t.title}
                </span>
                {t.detail && <span className="mt-0.5 block text-xs text-muted">{t.detail}</span>}
              </span>
              {t.meta != null && (
                <span className="mt-0.5 shrink-0 text-xs tabular-nums text-muted">{t.meta}</span>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
