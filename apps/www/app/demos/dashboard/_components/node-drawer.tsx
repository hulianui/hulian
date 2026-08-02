"use client";
import { copy } from "./node-drawer.content";
import {
  Button,
  Drawer,
  DrawerClose,
  DrawerContent,
  LineChart,
  Meter,
  Tag,
  Timeline,
} from "@hulianui/ui";
import { Activity, Radio, Signal, Timer } from "lucide-react";
import {
  NODE_STATUS_LABELS,
  REGION_LABELS,
  type NodeStatus,
  type PopNode,
} from "../_data/snapshot";

const STATUS_TONE: Record<NodeStatus, "success" | "warning" | "danger"> = {
  正常: "success",
  繁忙: "warning",
  告警: "danger",
};

// 由节点确定性生成一条近 12 点的 QPS sparkline（无随机、无外链）。
function sparkline(node: PopNode) {
  const base = node.qps / 1000;
  const seed = node.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return Array.from({ length: 12 }, (_, i) => ({
    t: `${i}`,
    QPS: Number((base + Math.sin((i + seed) / 2) * (base * 0.12)).toFixed(1)),
  }));
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-surface/50 px-3 py-2">
      <div className="mb-0.5 flex items-center gap-1.5 text-xs text-muted">
        {icon}
        {label}
      </div>
      <div className="text-lg font-semibold tabular-nums text-foreground">{value}</div>
    </div>
  );
}

export function NodeDrawer({
  node,
  open,
  onOpenChange,
}: {
  node: PopNode | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent
        side="right"
        className="w-[420px] max-w-[90vw]"
        title={
          node ? (
            <span className="flex items-center gap-2">
              {node.city}
              <Tag tone={STATUS_TONE[node.status]} size="sm" variant="soft" dot>
                {NODE_STATUS_LABELS[node.status]}
              </Tag>
              <span className="text-xs font-normal text-muted">
                {REGION_LABELS[node.region]} {copy("popNode")}
              </span>
            </span>
          ) : (
            copy("nodeDetails")
          )
        }
        description={copy("realTimeIndicatorDrillingDownDemoData")}
        footer={
          <DrawerClose render={<Button variant="outline" size="sm" />}>{copy("close")}</DrawerClose>
        }
      >
        {node && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-2.5">
              <Metric
                icon={<Activity className="size-3.5" />}
                label={copy("realTimeBandwidth")}
                value={`${node.bandwidth} Gbps`}
              />
              <Metric
                icon={<Radio className="size-3.5" />}
                label={copy("requestsSec")}
                value={node.qps.toLocaleString()}
              />
              <Metric
                icon={<Timer className="size-3.5" />}
                label={copy("averageDelay")}
                value={`${node.latency} ms`}
              />
              <Metric
                icon={<Signal className="size-3.5" />}
                label={copy("dayUptime")}
                value={`${node.uptime}%`}
              />
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="font-medium text-foreground/90">{copy("nodeLoad")}</span>
                <span
                  className="tabular-nums"
                  style={{
                    color:
                      node.load >= 85
                        ? "var(--color-danger)"
                        : node.load >= 70
                        ? "var(--color-chart-3)"
                        : "var(--color-chart-2)",
                  }}
                >
                  {node.load}%
                </span>
              </div>
              <Meter value={node.load} />
            </div>

            <div>
              <div className="mb-1 text-sm font-medium text-foreground/90">
                {copy("recentQPSTrends")}
              </div>
              <LineChart
                data={sparkline(node)}
                series={[{ key: "QPS", label: copy("qpsThousandTimesSecond") }]}
                xKey="t"
                height={150}
              />
            </div>

            <div>
              <div className="mb-2 text-sm font-medium text-foreground/90">
                {copy("nodeActivity")}
              </div>
              <Timeline
                items={[
                  {
                    color: STATUS_TONE[node.status],
                    label: copy("loadPercent", node.load),
                    children: copy("currentStatus", NODE_STATUS_LABELS[node.status]),
                  },
                  {
                    color: "primary",
                    label: `${node.latency} ms`,
                    children: copy("latestExitDetectionDelay"),
                  },
                  {
                    color: "success",
                    label: `${node.uptime}%`,
                    children: copy("onlineRateReachedInTheLastDays"),
                  },
                  {
                    color: "default",
                    label: copy("justNow"),
                    children: copy("includedInTheGlobalRealTimeDispatchPool"),
                  },
                ]}
              />
            </div>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
}
