"use client";
import { Marquee } from "@hulian/ui";
import { AlertTriangle, CheckCircle2, Info, Megaphone } from "lucide-react";
import type { DashEvent } from "../_data/snapshot";

const LEVEL_STYLE: Record<DashEvent["level"], { color: string; Icon: typeof Info }> = {
  严重: { color: "var(--color-danger)", Icon: AlertTriangle },
  警告: { color: "var(--color-chart-3)", Icon: AlertTriangle },
  提示: { color: "var(--color-chart-2)", Icon: CheckCircle2 },
  信息: { color: "var(--color-primary)", Icon: Info },
};

export function AlertTicker({ events }: { events: DashEvent[] }) {
  return (
    <div className="flex items-center gap-3 border-y border-border/70 bg-surface/40 px-6 py-1.5">
      <span className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-muted">
        <Megaphone className="size-3.5" />
        实时事件流
      </span>
      <div className="min-w-0 flex-1">
        <Marquee pauseOnHover duration={38} gap="2.5rem">
          {events.map((e) => {
            const { color, Icon } = LEVEL_STYLE[e.level];
            return (
              <span key={e.id} className="inline-flex items-center gap-1.5 text-sm text-foreground/90">
                <span
                  className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium"
                  style={{ color, backgroundColor: "color-mix(in oklch, currentColor 14%, transparent)" }}
                >
                  <Icon className="size-3" />
                  {e.level}
                </span>
                {e.text}
              </span>
            );
          })}
        </Marquee>
      </div>
    </div>
  );
}
