"use client";
import { copy } from "./page.content";

import { useRouter } from "next/navigation";
import { Activity, Coins, Gauge, Send, TriangleAlert } from "lucide-react";
import {
  AreaChart,
  BarChart,
  Banner,
  Button,
  Card,
  CardBody,
  CardHeader,
  NumberTicker,
  Stat,
  StatusDot,
} from "@hulianui/ui";
import { account, todayKpi, topModels, usageTrend } from "../_data/usage";
import { channels } from "../_data/channels";
import { requestLogs } from "../_data/logs";
import { modelOf } from "../_data/providers";
import { formatUsd } from "../_lib/pricing";
import { hrefFromKey } from "../_components/nav-config";

const statusLabel = { online: copy("online"), degraded: copy("downgrade"), offline: copy("offline"), maintenance: copy("maintenance") } as const;

export default function OverviewPage() {
  const router = useRouter();
  const lowBalance = account.balanceUsd < account.lowBalanceThreshold;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground">{copy("overview")}</h1>
        <p className="text-sm text-muted-foreground">{copy("todaySGatewayOperationStatusAsOf")}</p>
      </div>

      {lowBalance && (
        <Banner tone="warning" icon={<TriangleAlert className="size-4" />} action={<Button size="sm" variant="outline" onClick={() => router.push(hrefFromKey("billing"))}>{copy("goToRecharge")}</Button>}>{copy("accountBalanceIsLessThan")}{formatUsd(account.lowBalanceThreshold)}{copy("expected")}{account.estimatedDays}{copy("whenTheNumberOfDaysIsExhausted")}</Banner>
      )}

      {/* KPI */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card><CardBody><Stat icon={<Send className="size-4" />} label={copy("requestToday")} value={<NumberTicker value={todayKpi.requests} />} delta={8.4} /></CardBody></Card>
        <Card><CardBody><Stat icon={<Gauge className="size-4" />} label={copy("consumeTokens")} value={<NumberTicker value={todayKpi.tokens / 1_000_000} decimalPlaces={1} />} deltaLabel="M" delta={5.2} /></CardBody></Card>
        <Card><CardBody><Stat icon={<Coins className="size-4" />} label={copy("spendToday")} value={<span className="tabular-nums">{formatUsd(todayKpi.costUsd)}</span>} delta={-3.1} /></CardBody></Card>
        <Card><CardBody><Stat icon={<Activity className="size-4" />} label={copy("successRate")} value={<span className="tabular-nums">{(todayKpi.successRate * 100).toFixed(1)}%</span>} delta={0.3} /></CardBody></Card>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        {/* 用量趋势 */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex items-center justify-between">
            <span className="font-medium text-foreground">{copy("requestVolumeInThePastDays")}</span>
            <span className="text-xs text-muted-foreground">{copy("unitTimes")}</span>
          </CardHeader>
          <CardBody>
            <AreaChart data={usageTrend} xKey="date" series={[{ key: "requests", label: copy("numberOfRequests") }]} height={220} />
          </CardBody>
        </Card>

        {/* Top 模型 */}
        <Card>
          <CardHeader className="font-medium text-foreground">{copy("topModelTodaySSpending")}</CardHeader>
          <CardBody>
            <BarChart
              data={topModels.map((t) => ({ name: modelOf(t.model)?.name ?? t.model, cost: t.costUsd }))}
              xKey="name"
              series={[{ key: "cost", label: copy("spend") }]}
              horizontal
              height={220}
            />
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        {/* 上游健康墙 */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex items-center justify-between">
            <span className="font-medium text-foreground">{copy("upstreamChannelHealth")}</span>
            <Button size="sm" variant="ghost" onClick={() => router.push(hrefFromKey("health"))}>{copy("viewAll")}</Button>
          </CardHeader>
          <CardBody className="grid gap-2 sm:grid-cols-2">
            {channels.map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-[var(--radius)] border border-border bg-surface px-3 py-2">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-foreground">{c.name}</div>
                  <div className="text-xs text-muted-foreground">{c.models.length}{copy("modelsWeights")}{c.weight}</div>
                </div>
                <StatusDot
                  status={c.health}
                  label={statusLabel[c.health]}
                  extra={c.health === "online" || c.health === "degraded" ? `${c.latencyMs}ms` : undefined}
                />
              </div>
            ))}
          </CardBody>
        </Card>

        {/* 最近请求 */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <span className="font-medium text-foreground">{copy("recentRequests")}</span>
            <Button size="sm" variant="ghost" onClick={() => router.push(hrefFromKey("logs"))}>{copy("log")}</Button>
          </CardHeader>
          <CardBody className="flex flex-col gap-1.5">
            {requestLogs.slice(0, 6).map((l) => (
              <div key={l.id} className="flex items-center justify-between gap-2 text-sm">
                <span className="truncate text-foreground">{modelOf(l.model)?.name ?? l.model}</span>
                <span className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
                  <span className="tabular-nums">{l.latencyMs}ms</span>
                  <StatusDot status={l.status === "success" ? "online" : "offline"} />
                </span>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
