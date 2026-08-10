"use client";
import { copy } from "./kpi-rail.content";
import { Meter, NumberTicker, Skeleton } from "@hulianui/ui";
import { Activity, Gauge, Globe2, Link2, Radio, Timer } from "lucide-react";
import type { Snapshot } from "../_data/snapshot";
import { Panel } from "./panel";

interface KpiDef {
  key: string;
  label: string;
  value: number;
  decimals?: number;
  suffix?: string;
  Icon: typeof Activity;
  color: string;
}

function kpiDefs(s: Snapshot): KpiDef[] {
  return [
    {
      key: "nodes",
      label: copy("onlineNode"),
      value: s.kpis.onlineNodes,
      Icon: Globe2,
      color: "var(--color-chart-1)",
    },
    {
      key: "bw",
      label: copy("realTimeBandwidth"),
      value: Number((s.kpis.totalBandwidth / 1000).toFixed(2)),
      decimals: 2,
      suffix: "Tbps",
      Icon: Activity,
      color: "var(--color-chart-2)",
    },
    {
      key: "qps",
      label: copy("networkWideRequests"),
      value: Number((s.kpis.totalQps / 10000).toFixed(1)),
      decimals: 1,
      suffix: copy("tenThousandS"),
      Icon: Radio,
      color: "var(--color-chart-3)",
    },
    {
      key: "lat",
      label: copy("averageDelay"),
      value: s.kpis.avgLatency,
      suffix: "ms",
      Icon: Timer,
      color: "var(--color-chart-4)",
    },
    {
      key: "hit",
      label: copy("cacheHitRate"),
      value: s.kpis.hitRate,
      decimals: 1,
      suffix: "%",
      Icon: Gauge,
      color: "var(--color-chart-2)",
    },
    {
      key: "link",
      label: copy("schedulingLink"),
      value: s.kpis.linkCount,
      suffix: copy("strips"),
      Icon: Link2,
      color: "var(--color-chart-1)",
    },
  ];
}

function KpiTile({ def }: { def: KpiDef }) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-border/50 bg-surface/40 px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <def.Icon className="size-3.5" style={{ color: def.color }} />
        {def.label}
      </div>
      <div className="flex items-baseline gap-1">
        <NumberTicker
          value={def.value}
          decimalPlaces={def.decimals ?? 0}
          className="text-2xl font-semibold tabular-nums text-foreground"
          style={{ color: def.color }}
        />
        {def.suffix && <span className="text-xs text-muted-foreground">{def.suffix}</span>}
      </div>
    </div>
  );
}

export function KpiRail({ snapshot, loading }: { snapshot: Snapshot | null; loading: boolean }) {
  if (loading || !snapshot) {
    return (
      <Panel title={copy("coreMetrics")}>
        <div className="grid h-full grid-cols-2 content-start gap-2.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
          <Skeleton className="col-span-2 mt-2 h-24 w-full rounded-lg" />
        </div>
      </Panel>
    );
  }

  const defs = kpiDefs(snapshot);
  const globalLoad = Math.round(
    snapshot.regionLoad.reduce((a, r) => a + r.load, 0) / snapshot.regionLoad.length,
  );

  return (
    <Panel
      title={copy("coreMetrics")}
      extra={<span className="text-xs text-muted-foreground">{copy("refreshEvery3s")}</span>}
    >
      <div className="flex h-full flex-col gap-2.5">
        <div className="grid grid-cols-2 gap-2.5">
          {defs.map((d) => (
            <KpiTile key={d.key} def={d} />
          ))}
        </div>

        <div className="mt-auto rounded-lg border border-border/50 bg-surface/40 px-3 py-3">
          <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Gauge className="size-3.5" />
              {copy("globalLoad")}
            </span>
            <span
              className="font-semibold tabular-nums"
              style={{
                color:
                  globalLoad >= 80
                    ? "var(--color-danger)"
                    : globalLoad >= 65
                    ? "var(--color-chart-3)"
                    : "var(--color-chart-2)",
              }}
            >
              {globalLoad}%
            </span>
          </div>
          <Meter value={globalLoad} />
        </div>
      </div>
    </Panel>
  );
}
