"use client";
import { copy } from "./globe-panel.content";
import { Skeleton, WorldMap } from "@hulianui/ui";
import { MousePointerClick } from "lucide-react";
import { type Snapshot, toMapNodes } from "../_data/snapshot";
import { Panel } from "./panel";

const LEGEND = [
  { label: copy("normal"), color: "var(--color-chart-2)" },
  { label: copy("busy"), color: "var(--color-chart-3)" },
  { label: copy("warning"), color: "var(--color-danger)" },
];

export function GlobePanel({
  snapshot,
  loading,
  onPick,
}: {
  snapshot: Snapshot | null;
  loading: boolean;
  onPick: (nodeId: string) => void;
}) {
  const extra = (
    <div className="flex items-center gap-3">
      {LEGEND.map((l) => (
        <span key={l.label} className="flex items-center gap-1 text-xs text-muted">
          <span className="size-2 rounded-full" style={{ backgroundColor: l.color }} />
          {l.label}
        </span>
      ))}
      <span className="hidden items-center gap-1 text-xs text-muted xl:flex">
        <MousePointerClick className="size-3.5" />
        {copy("clickTheNodeToDrillDown")}
      </span>
    </div>
  );

  return (
    <Panel
      title={copy("globalNodeDistributionCrossBorderSchedulingLinks")}
      extra={extra}
      bodyClassName="grid place-items-center p-3"
    >
      {loading || !snapshot ? (
        <div className="w-full">
          <Skeleton className="mx-auto aspect-[2/1] w-full max-w-4xl rounded-xl" />
        </div>
      ) : (
        <div className="w-full max-w-5xl">
          <WorldMap
            points={toMapNodes(snapshot.nodes)}
            dots={snapshot.dots}
            showLabels
            flyingMarker="plane"
            duration={1.4}
            onPointClick={(node) => node.id && onPick(node.id)}
          />
        </div>
      )}
    </Panel>
  );
}
