"use client";
import { copy } from "./page.content";

import { useMemo, useState } from "react";
import { Activity, RadioTower, ShieldAlert } from "lucide-react";
import {
  Banner,
  Button,
  Card,
  CardBody,
  CardHeader,
  Descriptions,
  Divider,
  NumberField,
  Progress,
  Spin,
  StatusDot,
  Switch,
  Table,
  Tag,
  Timeline,
  toast,
  type ColumnDef,
} from "@hulianui/ui";
import { providerOf, modelOf } from "../../_data/providers";
import type { Channel } from "../../_data/types";
import { useProbe } from "./use-probe";

const statusLabel = { online: copy("online"), degraded: copy("downgrade"), offline: copy("offline"), maintenance: copy("maintenance") } as const;

/** 行内 sparkline：纯 token 着色的迷你条，呈现近 12 次成功率走势。 */
function Sparkline({ data, tone }: { data: number[]; tone: "success" | "warning" | "danger" }) {
  const color =
    tone === "success" ? "bg-success" : tone === "warning" ? "bg-warning" : "bg-danger";
  return (
    <span className="inline-flex h-6 items-end gap-[2px]" aria-hidden>
      {data.map((v, i) => (
        <span
          key={i}
          className={`w-[3px] rounded-[1px] ${color} opacity-80`}
          style={{ height: `${Math.max(8, Math.round(v * 100))}%` }}
        />
      ))}
    </span>
  );
}

export default function HealthPage() {
  const { channels, history, probing, runProbe } = useProbe();
  const [failThreshold, setFailThreshold] = useState<number | null>(5);
  const [autoDisable, setAutoDisable] = useState(true);

  const columns = useMemo<ColumnDef<Channel, any>[]>(
    () => [
      {
        accessorKey: "name",
        header: copy("channel"),
        cell: ({ row }) => {
          const c = row.original;
          const p = providerOf(c.provider);
          return (
            <div className="flex items-center gap-2">
              <span
                className="flex size-7 shrink-0 items-center justify-center rounded-[var(--radius-sm)] text-[11px] font-semibold text-white"
                style={{ backgroundColor: p.color }}
              >
                {p.glyph}
              </span>
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-foreground">{c.name}</div>
                <div className="text-xs text-muted">{p.name}</div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "health",
        header: copy("status"),
        cell: ({ row }) => {
          const c = row.original;
          const online = c.health === "online" || c.health === "degraded";
          return (
            <StatusDot
              status={c.health}
              label={statusLabel[c.health]}
              extra={online ? `${c.latencyMs}ms` : undefined}
            />
          );
        },
      },
      {
        accessorKey: "successRate",
        header: copy("successRate"),
        cell: ({ row }) => {
          const c = row.original;
          const tone = c.successRate >= 0.98 ? "success" : c.successRate >= 0.9 ? "warning" : "danger";
          return (
            <div className="flex items-center gap-2">
              <Sparkline data={c.trend} tone={tone} />
              <span className="tabular-nums text-sm text-foreground">
                {(c.successRate * 100).toFixed(1)}%
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "weight",
        header: copy("weight"),
        cell: ({ row }) => <span className="tabular-nums text-sm">{row.original.weight}</span>,
      },
      {
        accessorKey: "priority",
        header: copy("priority"),
        cell: ({ row }) => (
          <Tag tone={row.original.priority === 1 ? "brand" : "neutral"} size="sm">
            P{row.original.priority}
          </Tag>
        ),
      },
      {
        accessorKey: "rpmHeadroom",
        header: copy("speedLimitMargin"),
        cell: ({ row }) => {
          const c = row.original;
          const pct = Math.round(c.rpmHeadroom * 100);
          return (
            <div className="flex w-28 items-center gap-2">
              <Progress
                value={pct}
                tone={pct >= 50 ? "success" : pct >= 20 ? "warning" : "danger"}
                className="flex-1"
              />
              <span className="tabular-nums text-xs text-muted">{pct}%</span>
            </div>
          );
        },
      },
    ],
    [],
  );

  const downCount = channels.filter((c) => c.health === "offline" || c.health === "maintenance").length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">{copy("healthDetectionCenter")}</h1>
          <p className="text-sm text-muted">{copy("upstreamChannelPingSpeedMeasurementWeightedRouting")}</p>
        </div>
        <Button onClick={runProbe} loading={probing} disabled={probing}>
          <Activity className="size-4" />
          {probing ? copy("speedMeasurementInProgress") : copy("oneClickSpeedMeasurement")}
        </Button>
      </div>

      {downCount > 0 && (
        <Banner tone="warning" icon={<ShieldAlert className="size-4" />}>{copy("currentlyThereAre")}{downCount}{copy("channelIsUnavailableAndTrafficHasBeen")}</Banner>
      )}

      {/* 渠道列表 */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <span className="font-medium text-foreground">{copy("upstreamChannels")}</span>
          <span className="text-xs text-muted">{copy("total")}{channels.length}{copy("articleWeightedRoutingByPriorityWeight")}</span>
        </CardHeader>
        <CardBody className="p-0">
          <Spin spinning={probing} tip={copy("detectingEachUpstreamDelayAndSuccessRate")}>
            <Table columns={columns} data={channels} enableSorting density="middle" getRowId={(r) => r.id} />
          </Spin>
        </CardBody>
      </Card>

      <div className="grid gap-3 lg:grid-cols-3">
        {/* 渠道 → 模型映射 */}
        <Card className="lg:col-span-2">
          <CardHeader className="font-medium text-foreground">{copy("channelModelMapping")}</CardHeader>
          <CardBody className="flex flex-col gap-3">
            {channels.map((c) => (
              <div key={c.id} className="flex flex-wrap items-center gap-2">
                <span className="flex w-40 shrink-0 items-center gap-2">
                  <StatusDot status={c.health} size="sm" />
                  <span className="truncate text-sm font-medium text-foreground">{c.name}</span>
                </span>
                <span className="text-xs text-muted">{copy("weight2")}{c.weight} · P{c.priority}</span>
                <span className="flex flex-wrap gap-1.5">
                  {c.models.map((m) => (
                    <Tag key={m} size="sm" tone="neutral" variant="outline">
                      {modelOf(m)?.name ?? m}
                    </Tag>
                  ))}
                </span>
              </div>
            ))}
          </CardBody>
        </Card>

        {/* 熔断规则 */}
        <Card>
          <CardHeader className="flex items-center gap-2 font-medium text-foreground">
            <RadioTower className="size-4 text-muted" />{copy("circuitBreakerRules")}</CardHeader>
          <CardBody className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-medium text-foreground">{copy("continuousFailureThreshold")}</div>
                <div className="text-xs text-muted">{copy("afterReachingTheNumberOfTimesThe")}</div>
              </div>
              <NumberField
                value={failThreshold}
                onValueChange={setFailThreshold}
                min={1}
                max={20}
                aria-label={copy("continuousFailureThreshold2")}
                className="w-28"
              />
            </div>
            <Divider />
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-medium text-foreground">{copy("automaticallyDisableChannels")}</div>
                <div className="text-xs text-muted">{copy("automaticallyOfflineAfterTheFuseIsBroken")}</div>
              </div>
              <Switch checked={autoDisable} onCheckedChange={setAutoDisable} aria-label={copy("automaticallyDisableChannels2")} />
            </div>
            <Divider />
            <Descriptions
              column={1}
              items={[
                { label: copy("downgradeTransfer"), children: copy("thoseThatHitTheThresholdAreRemoved") },
                { label: copy("halfOpenDetection"), children: copy("oneTrialRequestIsReleasedEveryS") },
                { label: copy("diggingStrategy"), children: autoDisable ? copy("whenAllAreUnavailableReturnAndTrigger") : copy("maintainTheOriginalChannelUntilManualIntervention") },
              ]}
            />
          </CardBody>
        </Card>
      </div>

      {/* 探测历史 */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <span className="font-medium text-foreground">{copy("detectionHistory")}</span>
          <Button variant="ghost" size="sm" onClick={() => toast({ title: copy("probeLogCopied"), tone: "info" })}>{copy("exportLog")}</Button>
        </CardHeader>
        <CardBody>
          <Timeline
            items={history.map((h) => ({
              color: h.ok ? "success" : "danger",
              label: `${h.time} · ${h.channel}`,
              children: (
                <span className="text-sm text-foreground">
                  {h.note}
                  {h.ok && h.latencyMs > 0 ? ` · ${h.latencyMs}ms` : ""}
                </span>
              ),
            }))}
          />
        </CardBody>
      </Card>
    </div>
  );
}
