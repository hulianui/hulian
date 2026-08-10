"use client";
import { copy } from "./region-meters.content";
import { Meter, Skeleton } from "@hulianui/ui";
import { REGION_LABELS, type Snapshot } from "../_data/snapshot";
import { Panel } from "./panel";

function loadColor(load: number) {
  if (load >= 80) return "var(--color-danger)";
  if (load >= 65) return "var(--color-chart-3)";
  return "var(--color-chart-2)";
}

export function RegionMeters({
  snapshot,
  loading,
}: {
  snapshot: Snapshot | null;
  loading: boolean;
}) {
  return (
    <Panel title={copy("zoneLoad")} bodyClassName="p-3">
      <div className="grid grid-cols-3 gap-x-6 gap-y-2.5 md:grid-cols-6">
        {loading || !snapshot
          ? Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-full rounded" />
            ))
          : snapshot.regionLoad.map((r) => (
              <div key={r.region} className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{REGION_LABELS[r.region]}</span>
                  <span className="font-medium tabular-nums" style={{ color: loadColor(r.load) }}>
                    {r.load}%
                  </span>
                </div>
                <Meter value={r.load} />
              </div>
            ))}
      </div>
    </Panel>
  );
}
