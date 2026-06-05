"use client";
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
} from "@hulian/ui";
import { Maximize, Pause, Play, RefreshCw, Satellite } from "lucide-react";

export type DataSource = "正常" | "异常";

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

function IconAction({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button variant="ghost" size="iconSm" aria-label={label} onClick={onClick} className="text-muted hover:text-foreground">
            {children}
          </Button>
        }
      />
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

export function HeaderBar({ source, onSourceChange, running, onToggleRunning, onRefresh, refreshing }: HeaderBarProps) {
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
          <div className="text-lg font-semibold tracking-tight text-foreground">瀚云全球调度指挥中心</div>
          <div className="text-xs text-muted">HanCloud Global CDN · Real-time Orchestration</div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-full border border-border bg-surface/60 px-3 py-1.5 font-mono text-sm tabular-nums text-foreground md:flex">
          <Dot tone={source === "异常" ? "danger" : running ? "success" : "warning"} pulse={running && source !== "异常"} />
          {clock}
        </div>

        <Select
          value={source}
          onValueChange={(v) => onSourceChange(v as DataSource)}
          items={[
            { value: "正常", label: "数据源：正常" },
            { value: "异常", label: "数据源：异常" },
          ]}
        >
          <SelectTrigger className="w-36" aria-label="数据源" />
          <SelectContent>
            <SelectItem value="正常">数据源：正常</SelectItem>
            <SelectItem value="异常">数据源：异常</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-0.5">
          <IconAction label="手动刷新" onClick={onRefresh}>
            <RefreshCw className={refreshing ? "size-4 animate-spin" : "size-4"} />
          </IconAction>

          {running ? (
            <Popconfirm
              title="停止实时刷新？"
              description="停止后大屏将不再自动拉取实时指标，需手动刷新。"
              okText="停止"
              danger
              onConfirm={() => onToggleRunning(false)}
            >
              <Button
                variant="ghost"
                size="iconSm"
                aria-label="停止实时刷新"
                title="停止实时刷新"
                className="text-muted hover:text-foreground"
              >
                <Pause className="size-4" />
              </Button>
            </Popconfirm>
          ) : (
            <IconAction label="恢复实时刷新" onClick={() => onToggleRunning(true)}>
              <Play className="size-4" />
            </IconAction>
          )}

          <IconAction label="全屏" onClick={toggleFullscreen}>
            <Maximize className="size-4" />
          </IconAction>

          <Tooltip>
            <TooltipTrigger render={<AnimatedThemeToggler className="grid size-8 place-items-center rounded-md text-muted hover:text-foreground" />} />
            <TooltipContent>切换明暗</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </header>
  );
}
