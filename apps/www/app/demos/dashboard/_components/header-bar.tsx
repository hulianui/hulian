"use client";
import { copy } from "./header-bar.content";
import { useEffect, useState } from "react";
import {
  AnimatedThemeToggler,
  Button,
  Dot,
  Popconfirm,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@hulianui/ui";
import { Maximize, Pause, Play, RefreshCw, Satellite } from "lucide-react";

export type DataSource = "正常" | "异常";

export const DATA_SOURCE_LABELS: Record<DataSource, string> = {
  正常: copy("dataSourceNormal"),
  异常: copy("dataSourceException"),
};

export interface HeaderBarProps {
  source: DataSource;
  onSourceChange: (s: DataSource) => void;
  running: boolean;
  onToggleRunning: (next: boolean) => void;
  onRefresh: () => void;
  refreshing: boolean;
}

function useClock() {
  const [now, setNow] = useState("--:--:--");
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      const p = (n: number) => String(n).padStart(2, "0");
      setNow(`${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

function IconAction({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="iconSm"
            aria-label={label}
            onClick={onClick}
            className="text-muted hover:text-foreground"
          >
            {children}
          </Button>
        }
      />
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

export function HeaderBar({
  source,
  onSourceChange,
  running,
  onToggleRunning,
  onRefresh,
  refreshing,
}: HeaderBarProps) {
  const clock = useClock();

  const toggleFullscreen = () => {
    if (typeof document === "undefined") return;
    if (document.fullscreenElement) void document.exitFullscreen?.();
    else void document.documentElement.requestFullscreen?.();
  };

  return (
    <header className="flex items-center justify-between gap-4 px-6 py-3">
      <div className="flex items-center gap-3">
        <span className="grid size-9 place-items-center rounded-lg bg-primary/15 text-primary">
          <Satellite className="size-5" />
        </span>
        <div className="leading-tight">
          <div className="text-lg font-semibold tracking-tight text-foreground">
            {copy("hanyunGlobalDispatchCommandCenter")}
          </div>
          <div className="text-xs text-muted">HanCloud Global CDN · Real-time Orchestration</div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-full border border-border bg-surface/60 px-3 py-1.5 font-mono text-sm tabular-nums text-foreground md:flex">
          <Dot
            tone={source === "异常" ? "danger" : running ? "success" : "warning"}
            pulse={running && source !== "异常"}
          />
          {clock}
        </div>

        <Select
          value={source}
          onValueChange={(v) => onSourceChange(v as DataSource)}
          items={[
            { value: "正常", label: copy("dataSourceNormal") },
            { value: "异常", label: copy("dataSourceException") },
          ]}
        >
          <SelectTrigger className="w-36" aria-label={copy("dataSource")} />
          <SelectContent>
            <SelectItem value={"正常"}>{copy("dataSourceNormal")}</SelectItem>
            <SelectItem value={"异常"}>{copy("dataSourceException")}</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-0.5">
          <IconAction label={copy("manualRefresh")} onClick={onRefresh}>
            <RefreshCw className={refreshing ? "size-4 animate-spin" : "size-4"} />
          </IconAction>

          {running ? (
            <Popconfirm
              title={copy("stopLiveRefresh")}
              description={copy("afterStoppingTheLargeScreenWillNoLongerAutomaticallyPull")}
              okText={copy("stop")}
              danger
              onConfirm={() => onToggleRunning(false)}
            >
              <Button
                variant="ghost"
                size="iconSm"
                aria-label={copy("stopLiveRefreshAlternate")}
                title={copy("stopLiveRefreshAlternate")}
                className="text-muted hover:text-foreground"
              >
                <Pause className="size-4" />
              </Button>
            </Popconfirm>
          ) : (
            <IconAction label={copy("resumeLiveRefresh")} onClick={() => onToggleRunning(true)}>
              <Play className="size-4" />
            </IconAction>
          )}

          <IconAction label={copy("fullscreen")} onClick={toggleFullscreen}>
            <Maximize className="size-4" />
          </IconAction>

          <Tooltip>
            <TooltipTrigger
              render={
                <AnimatedThemeToggler className="grid size-8 place-items-center rounded-md text-muted hover:text-foreground" />
              }
            />
            <TooltipContent>{copy("toggleLightAndDark")}</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </header>
  );
}
