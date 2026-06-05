"use client";
import { Skeleton, WorldMap } from "@hulianui/ui";
import { MousePointerClick } from "lucide-react";
import { type Snapshot, toMapNodes } from "../_data/snapshot";
import { Panel } from "./panel";

const LEGEND = [
  { label: "正常", color: "var(--color-chart-2)" },
  { label: "繁忙", color: "var(--color-chart-3)" },
  { label: "告警", color: "var(--color-danger)" },
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
        点击节点下钻
      </span>
    </div>
  );

  return (
    <Panel title="全球节点分布 · 跨境调度链路" extra={extra} bodyClassName="grid place-items-center p-3">
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
