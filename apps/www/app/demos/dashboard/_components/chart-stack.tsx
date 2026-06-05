"use client";
import { AreaChart, BarChart, LineChart, PieChart, Skeleton } from "@hulianui/ui";
import type { Snapshot } from "../_data/snapshot";
import { Panel } from "./panel";

function ChartSkeleton({ h }: { h: number }) {
  return (
    <div style={{ height: h }} className="w-full">
      <Skeleton className="h-full w-full rounded-lg" />
    </div>
  );
}

// 右栏：环形占比 + 折线趋势 + 柱状对比
export function ChartStack({ snapshot, loading }: { snapshot: Snapshot | null; loading: boolean }) {
  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <Panel title="流量占比 · 按大区" className="flex-1" bodyClassName="grid place-items-center p-2">
        {loading || !snapshot ? <ChartSkeleton h={170} /> : <PieChart data={snapshot.trafficPie} donut height={188} />}
      </Panel>

      <Panel title="全网 QPS · 24h（万次/秒）" className="flex-1" bodyClassName="p-2">
        {loading || !snapshot ? (
          <ChartSkeleton h={170} />
        ) : (
          <LineChart
            data={snapshot.qpsSeries}
            series={[
              { key: "请求", label: "请求" },
              { key: "命中", label: "命中" },
            ]}
            xKey="hour"
            height={188}
          />
        )}
      </Panel>

      <Panel title="区域带宽对比（Gbps）" className="flex-1" bodyClassName="p-2">
        {loading || !snapshot ? (
          <ChartSkeleton h={170} />
        ) : (
          <BarChart data={snapshot.regionBars} series={[{ key: "带宽", label: "带宽" }]} xKey="region" height={188} />
        )}
      </Panel>
    </div>
  );
}

// 中部下方：各大区带宽趋势（堆叠面积）
export function BandwidthArea({ snapshot, loading }: { snapshot: Snapshot | null; loading: boolean }) {
  return (
    <Panel title="各大区带宽趋势 · 堆叠（Gbps）" bodyClassName="p-2">
      {loading || !snapshot ? (
        <ChartSkeleton h={150} />
      ) : (
        <AreaChart
          data={snapshot.bandwidthArea}
          series={[
            { key: "亚太", label: "亚太" },
            { key: "北美", label: "北美" },
            { key: "欧洲", label: "欧洲" },
          ]}
          xKey="t"
          stacked
          height={164}
        />
      )}
    </Panel>
  );
}
