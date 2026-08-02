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

export function Dossier({
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
