import { memo } from "react";
import { Check } from "../_icons";
import { cn } from "../lib/cn";
import type { DossierProps, DossierSectionStatus } from "./dossier.types";

function StatusIcon({ status }: { status: DossierSectionStatus }) {
  if (status === "done")
    return (
      <span className="flex size-4 items-center justify-center rounded-full bg-success/15">
        <Check className="size-3 text-success" aria-hidden />
      </span>
    );
  if (status === "partial")
    return (
      <span
        aria-hidden
        className="size-3.5 rounded-full border-2 border-primary text-primary"
        style={{ background: "linear-gradient(to top, currentColor 50%, transparent 50%)" }}
      />
    );
  return <span aria-hidden className="size-3.5 rounded-full border-2 border-border" />;
}

function DossierImpl({
  sections,
  title = "案卷",
  progress,
  archivedLabel = "已归档",
  optionalLabel = "可选",
  bare = false,
  className,
}: DossierProps) {
  const required = sections.filter((s) => !s.optional);
  const done = required.filter((s) => s.status === "done").length;
  return (
    <div
      className={cn(
        !bare && "rounded-[var(--radius)] border border-border bg-surface p-3",
        className,
      )}
    >
      <div className="mb-2.5 flex items-baseline justify-between gap-2">
        {title && <p className="text-xs font-medium text-muted">{title}</p>}
        <span className="text-xs tabular-nums text-muted">
          {progress ?? <>{archivedLabel} {done}/{required.length}</>}
        </span>
      </div>
      <ol className="space-y-1">
        {sections.map((s) => {
          const status = s.status ?? "empty";
          return (
            <li
              key={s.key}
              data-active={s.active || undefined}
              className={cn(
                "flex items-start gap-2.5 rounded-lg px-2 py-1.5 text-sm",
                s.active && "bg-surface-hover",
              )}
            >
              <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center">
                <StatusIcon status={status} />
              </span>
              <span className="min-w-0 flex-1">
                <span
                  className={cn(
                    "flex items-center gap-1.5",
                    status === "empty" ? "text-muted" : "text-foreground",
                  )}
                >
                  {s.label}
                  {s.optional && status === "empty" && (
                    <span className="text-[10px] text-muted/70">{optionalLabel}</span>
                  )}
                </span>
                {s.summary != null && (
                  <span className="mt-0.5 block truncate text-xs text-muted">{s.summary}</span>
                )}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
DossierImpl.displayName = "Dossier";

// 案卷面板固定挂在访谈/表单页侧栏，父级每次输入都重渲，而 sections 常整段不变；
// 不 memo 就要重跑 filter 统计并重算每个域行（含 StatusIcon）。
// props 全稳定时 React 无法自己 bailout，只能靠 memo —— 与 Button/Checkbox/Chip 同一处方。
export const Dossier = memo(DossierImpl);
Dossier.displayName = "Dossier";
