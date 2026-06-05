"use client";
import { Meter, NumberTicker, Skeleton } from "@hulian/ui";
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
    { key: "nodes", label: "在线节点", value: s.kpis.onlineNodes, Icon: Globe2, color: "var(--color-chart-1)" },
    { key: "bw", label: "实时带宽", value: Number((s.kpis.totalBandwidth / 1000).toFixed(2)), decimals: 2, suffix: "Tbps", Icon: Activity, color: "var(--color-chart-2)" },
    { key: "qps", label: "全网请求", value: Number((s.kpis.totalQps / 10000).toFixed(1)), decimals: 1, suffix: "万/s", Icon: Radio, color: "var(--color-chart-3)" },
    { key: "lat", label: "平均延迟", value: s.kpis.avgLatency, suffix: "ms", Icon: Timer, color: "var(--color-chart-4)" },
    { key: "hit", label: "缓存命中率", value: s.kpis.hitRate, decimals: 1, suffix: "%", Icon: Gauge, color: "var(--color-chart-2)" },
    { key: "link", label: "调度链路", value: s.kpis.linkCount, suffix: "条", Icon: Link2, color: "var(--color-chart-1)" },
  ];
}

function KpiTile({ def }: { def: KpiDef }) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-border/50 bg-surface/40 px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-xs text-muted">
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
        {def.suffix && <span className="text-xs text-muted">{def.suffix}</span>}
      </div>
    </div>
  );
}

export function KpiRail({ snapshot, loading }: { snapshot: Snapshot | null; loading: boolean }) {
  if (loading || !snapshot) {
    return (
      <Panel title="核心指标">
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
    <Panel title="核心指标" extra={<span className="text-xs text-muted">每 3s 刷新</span>}>
      <div className="flex h-full flex-col gap-2.5">
        <div className="grid grid-cols-2 gap-2.5">
          {defs.map((d) => (
            <KpiTile key={d.key} def={d} />
          ))}
        </div>

        <div className="mt-auto rounded-lg border border-border/50 bg-surface/40 px-3 py-3">
          <div className="mb-2 flex items-center justify-between text-xs text-muted">
            <span className="flex items-center gap-1.5">
              <Gauge className="size-3.5" />
              全局负载
            </span>
            <span
              className="font-semibold tabular-nums"
              style={{ color: globalLoad >= 80 ? "var(--color-danger)" : globalLoad >= 65 ? "var(--color-chart-3)" : "var(--color-chart-2)" }}
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
