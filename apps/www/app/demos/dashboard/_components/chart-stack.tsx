"use client";
import { copy } from "./chart-stack.content";
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
      <Panel
        title={copy("trafficRatioByRegion")}
        className="flex-1"
        bodyClassName="grid place-items-center p-2"
      >
        {loading || !snapshot ? (
          <ChartSkeleton h={170} />
        ) : (
          <PieChart data={snapshot.trafficPie} donut height={188} />
        )}
      </Panel>

      <Panel title={copy("networkWideQPS24hTimesSecond")} className="flex-1" bodyClassName="p-2">
        {loading || !snapshot ? (
          <ChartSkeleton h={170} />
        ) : (
          <LineChart
            data={snapshot.qpsSeries}
            series={[
              { key: "requests", label: copy("request") },
              { key: "hits", label: copy("hit") },
            ]}
            xKey="hour"
            height={188}
          />
        )}
      </Panel>

      <Panel title={copy("regionalBandwidthComparisonGbps")} className="flex-1" bodyClassName="p-2">
        {loading || !snapshot ? (
          <ChartSkeleton h={170} />
        ) : (
          <BarChart
            data={snapshot.regionBars}
            series={[{ key: "bandwidth", label: copy("bandwidth") }]}
            xKey="region"
            height={188}
          />
        )}
      </Panel>
    </div>
  );
}

// 中部下方：各大区带宽趋势（堆叠面积）
export function BandwidthArea({
  snapshot,
  loading,
}: {
  snapshot: Snapshot | null;
  loading: boolean;
}) {
  return (
    <Panel title={copy("bandwidthTrendsByRegionStackingGbps")} bodyClassName="p-2">
      {loading || !snapshot ? (
        <ChartSkeleton h={150} />
      ) : (
        <AreaChart
          data={snapshot.bandwidthArea}
          series={[
            { key: "asiaPacific", label: copy("asiaPacific") },
            { key: "northAmerica", label: copy("northAmerica") },
            { key: "europe", label: copy("europe") },
          ]}
          xKey="t"
          stacked
          height={164}
        />
      )}
    </Panel>
  );
}
