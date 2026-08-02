"use client";
import { copy } from "./overview-load-grid.content";

// 调度总览 · 执行器负载概览网格：每个执行器一张卡，ScoreRing 显当前负载 + Sparkline 负载趋势。
import { Card, CardBody, ScoreRing, Sparkline, StatusDot, Tag } from "@hulianui/ui";
import type { Executor, ExecutorHealth } from "../_data/types";
import { seriesValues } from "../_data/metrics";

const HEALTH_STATUS: Record<ExecutorHealth, "online" | "degraded" | "offline"> = {
  healthy: "online",
  degraded: "degraded",
  offline: "offline",
};

const HEALTH_LABEL: Record<ExecutorHealth, string> = {
  healthy: copy("health"),
  degraded: copy("downgrade"),
  offline: copy("offline"),
};

// 负载越高越红：用满分 100、按负载值反推「健康度」反而绕，这里直接以负载值驱动等级带
// （高负载 = 危险红，低负载 = 富余绿），与「饱和度」语义一致。
const LOAD_GRADES = [
  { min: 0, label: copy("surplus"), tone: "var(--color-success)" },
  { min: 50, label: copy("moderate"), tone: "var(--color-chart-2)" },
  { min: 75, label: copy("relativelyHigh"), tone: "var(--color-warning)" },
  { min: 90, label: copy("saturated"), tone: "var(--color-danger)" },
];

/** 用 QPS 时序的一段作为各执行器的「负载趋势」mock 波形（确定性：按 index 切片）。 */
function loadTrend(index: number): number[] {
  const base = seriesValues("queue");
  const start = (index * 3) % Math.max(1, base.length - 8);
  return base.slice(start, start + 8);
}

export function OverviewLoadGrid({ executors }: { executors: Executor[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {executors.map((e, i) => {
        const loadPct = Math.round(e.load * 100);
        const tone = loadPct >= 90 ? "danger" : loadPct >= 75 ? "warning" : "neutral";
        return (
          <Card key={e.id}>
            <CardBody className="flex flex-col items-center gap-2 text-center">
              <div className="flex w-full items-center justify-between gap-1">
                <Tag size="sm" tone={e.kind === "agent" ? "brand" : "neutral"} variant="soft">
                  {e.kind === "agent" ? "Agent" : copy("model")}
                </Tag>
                <StatusDot
                  status={HEALTH_STATUS[e.health]}
                  label={HEALTH_LABEL[e.health]}
                  size="sm"
                />
              </div>
              <ScoreRing
                value={loadPct}
                grades={LOAD_GRADES}
                size={84}
                thickness={7}
                label={copy("currentLoad")}
              />
              <div className="min-w-0 w-full">
                <div className="truncate text-sm font-medium text-foreground">{e.name}</div>
                <div className="truncate text-xs text-muted">{copy("andIssuedThemSimultaneously")}{Math.round(e.load * e.maxConcurrency)}/{e.maxConcurrency}
                </div>
              </div>
              <Sparkline
                data={loadTrend(i)}
                variant="area"
                tone={
                  tone === "danger"
                    ? "var(--color-danger)"
                    : tone === "warning"
                      ? "var(--color-warning)"
                      : "var(--color-primary)"
                }
                width={120}
                height={26}
                className="mt-0.5"
              />
            </CardBody>
          </Card>
        );
      })}
    </div>
  );
}
