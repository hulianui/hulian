import { copy } from "./run-panel.content";
import { X, CheckCircle2 } from "lucide-react";
import { Dot, Progress, Spinner, Text, cn } from "@hulianui/ui";
import type { RunLogEntry } from "../../_lib/use-flow-run";

interface RunPanelProps {
  running: boolean;
  progress: number;
  log: RunLogEntry[];
  onClose: () => void;
}

/** 底部运行面板：进度条 + 逐节点执行日志。运行中或有产物时显示。 */
export function RunPanel({ running, progress, log, onClose }: RunPanelProps) {
  const done = !running && progress >= 100;
  return (
    <div className="absolute inset-x-3 bottom-3 z-20 overflow-hidden rounded-[calc(var(--radius)+0.25rem)] border border-border bg-surface/95 shadow-lg backdrop-blur">
      <div className="flex items-center gap-3 border-b border-border px-3.5 py-2.5">
        {running ? (
          <Spinner size="sm" tone="primary" />
        ) : done ? (
          <CheckCircle2 className="size-4 text-success" />
        ) : (
          <Dot tone="neutral" />
        )}
        <Text size="sm" weight="medium" className="shrink-0">
          {running ? copy("generating") : done ? copy("buildComplete") : copy("run")}
        </Text>
        <div className="min-w-0 flex-1">
          <Progress value={progress} />
        </div>
        <Text size="xs" tone="muted" className="w-10 shrink-0 text-right tabular-nums">
          {progress}%
        </Text>
        <button
          type="button"
          aria-label={copy("closeRunPanel")}
          onClick={onClose}
          className="grid size-6 shrink-0 place-items-center rounded-[var(--radius)] text-muted hover:bg-surface-hover hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      </div>
      {log.length > 0 && (
        <ul className="max-h-32 space-y-1 overflow-y-auto px-3.5 py-2.5">
          {log.map((e) => (
            <li key={e.id} className="flex items-center gap-2 text-xs">
              {e.status === "running" ? (
                <Spinner size="sm" tone="primary" />
              ) : (
                <Dot tone="success" />
              )}
              <span className="font-medium text-foreground">{e.title}</span>
              <span className={cn("text-muted", e.status === "done" && "text-success")}>
                {e.text}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
