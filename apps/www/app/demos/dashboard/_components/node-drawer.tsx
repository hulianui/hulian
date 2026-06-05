"use client";
import { Button, Drawer, DrawerClose, DrawerContent, LineChart, Meter, Tag, Timeline } from "@hulianui/ui";
import { Activity, Radio, Signal, Timer } from "lucide-react";
import type { NodeStatus, PopNode } from "../_data/snapshot";

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

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
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
                {node.status}
              </Tag>
              <span className="text-xs font-normal text-muted">{node.region} · PoP 节点</span>
            </span>
          ) : (
            "节点详情"
          )
        }
        description="实时指标下钻 · 演示数据"
        footer={
          <DrawerClose render={<Button variant="outline" size="sm" />}>关闭</DrawerClose>
        }
      >
        {node && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-2.5">
              <Metric icon={<Activity className="size-3.5" />} label="实时带宽" value={`${node.bandwidth} Gbps`} />
              <Metric icon={<Radio className="size-3.5" />} label="请求/秒" value={node.qps.toLocaleString()} />
              <Metric icon={<Timer className="size-3.5" />} label="平均延迟" value={`${node.latency} ms`} />
              <Metric icon={<Signal className="size-3.5" />} label="30 天在线率" value={`${node.uptime}%`} />
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="font-medium text-foreground/90">节点负载</span>
                <span
                  className="tabular-nums"
                  style={{ color: node.load >= 85 ? "var(--color-danger)" : node.load >= 70 ? "var(--color-chart-3)" : "var(--color-chart-2)" }}
                >
                  {node.load}%
                </span>
              </div>
              <Meter value={node.load} />
            </div>

            <div>
              <div className="mb-1 text-sm font-medium text-foreground/90">近时 QPS 趋势</div>
              <LineChart data={sparkline(node)} series={[{ key: "QPS", label: "QPS（千次/秒）" }]} xKey="t" height={150} />
            </div>

            <div>
              <div className="mb-2 text-sm font-medium text-foreground/90">节点动态</div>
              <Timeline
                items={[
                  { color: STATUS_TONE[node.status], label: `负载 ${node.load}%`, children: `当前状态：${node.status}` },
                  { color: "primary", label: `${node.latency} ms`, children: "最近一次出口探测延迟" },
                  { color: "success", label: `${node.uptime}%`, children: "近 30 天在线率达标" },
                  { color: "default", label: "刚刚", children: "已纳入全球实时调度池" },
                ]}
              />
            </div>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
}
