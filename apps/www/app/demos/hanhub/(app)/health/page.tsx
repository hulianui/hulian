"use client";
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
} from "@hulian/ui";
import { providerOf, modelOf } from "../../_data/providers";
import type { Channel } from "../../_data/types";
import { useProbe } from "./use-probe";

const statusLabel = { online: "在线", degraded: "降级", offline: "离线", maintenance: "维护" } as const;

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
        header: "渠道",
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
        header: "状态",
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
        header: "成功率",
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
        header: "权重",
        cell: ({ row }) => <span className="tabular-nums text-sm">{row.original.weight}</span>,
      },
      {
        accessorKey: "priority",
        header: "优先级",
        cell: ({ row }) => (
          <Tag tone={row.original.priority === 1 ? "brand" : "neutral"} size="sm">
            P{row.original.priority}
          </Tag>
        ),
      },
      {
        accessorKey: "rpmHeadroom",
        header: "限速余量",
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
          <h1 className="text-xl font-semibold text-foreground">健康探测中心</h1>
          <p className="text-sm text-muted">上游渠道 ping / 测速 · 加权路由 · 被动失败转移 · 阈值熔断</p>
        </div>
        <Button onClick={runProbe} loading={probing} disabled={probing}>
          <Activity className="size-4" />
          {probing ? "测速中…" : "一键测速"}
        </Button>
      </div>

      {downCount > 0 && (
        <Banner tone="warning" icon={<ShieldAlert className="size-4" />}>
          当前有 {downCount} 个渠道不可用，流量已自动转移至健康渠道，请关注降级影响。
        </Banner>
      )}

      {/* 渠道列表 */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <span className="font-medium text-foreground">上游渠道</span>
          <span className="text-xs text-muted">共 {channels.length} 条 · 按优先级 + 权重加权路由</span>
        </CardHeader>
        <CardBody className="p-0">
          <Spin spinning={probing} tip="正在探测各上游延迟与成功率…">
            <Table columns={columns} data={channels} enableSorting density="middle" getRowId={(r) => r.id} />
          </Spin>
        </CardBody>
      </Card>

      <div className="grid gap-3 lg:grid-cols-3">
        {/* 渠道 → 模型映射 */}
        <Card className="lg:col-span-2">
          <CardHeader className="font-medium text-foreground">渠道 → 模型映射</CardHeader>
          <CardBody className="flex flex-col gap-3">
            {channels.map((c) => (
              <div key={c.id} className="flex flex-wrap items-center gap-2">
                <span className="flex w-40 shrink-0 items-center gap-2">
                  <StatusDot status={c.health} size="sm" />
                  <span className="truncate text-sm font-medium text-foreground">{c.name}</span>
                </span>
                <span className="text-xs text-muted">权重 {c.weight} · P{c.priority}</span>
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
            <RadioTower className="size-4 text-muted" />
            熔断规则
          </CardHeader>
          <CardBody className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-medium text-foreground">连续失败阈值</div>
                <div className="text-xs text-muted">达到次数后触发熔断转移</div>
              </div>
              <NumberField
                value={failThreshold}
                onValueChange={setFailThreshold}
                min={1}
                max={20}
                aria-label="连续失败阈值"
                className="w-28"
              />
            </div>
            <Divider />
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-medium text-foreground">自动禁用渠道</div>
                <div className="text-xs text-muted">熔断后自动下线，恢复后自动接回</div>
              </div>
              <Switch checked={autoDisable} onCheckedChange={setAutoDisable} aria-label="自动禁用渠道" />
            </div>
            <Divider />
            <Descriptions
              column={1}
              items={[
                { label: "降级转移", children: "命中阈值即从加权池摘除，按优先级转移到次级渠道" },
                { label: "半开探测", children: "每 60s 放行 1 次试探请求，连续 3 次成功即恢复路由" },
                { label: "兜底策略", children: autoDisable ? "全部不可用时返回 503 并触发告警" : "保持原渠道直至人工介入" },
              ]}
            />
          </CardBody>
        </Card>
      </div>

      {/* 探测历史 */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <span className="font-medium text-foreground">探测历史</span>
          <Button variant="ghost" size="sm" onClick={() => toast({ title: "已复制探测日志", tone: "info" })}>
            导出日志
          </Button>
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
