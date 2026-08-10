"use client";
import { copy } from "./page.content";

// 调度总览 Dashboard：KPI · 任务漏斗 · 执行器负载 · 队列/延迟/成本时序 · 最近任务流 · 告警。
import { useRouter } from "next/navigation";
import {
  Activity,
  AlertTriangle,
  Clock,
  Coins,
  Gauge,
  ListChecks,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import {
  AreaChart,
  Banner,
  Button,
  Card,
  CardBody,
  CardHeader,
  Funnel,
  NumberTicker,
  Sparkline,
  Stat,
} from "@hulianui/ui";
import { EXECUTORS } from "../_data/executors";
import { FUNNEL_STAGES, METRICS, seriesValues } from "../_data/metrics";
import { TASKS } from "../_data/tasks";
import { evaluateSla } from "../_lib/sla";
import { ROOT } from "../_components/nav-config";
import { OverviewLoadGrid } from "../_components/overview-load-grid";
import { OverviewTaskFlow } from "../_components/overview-task-flow";

// ── 派生 KPI（取末点 / 聚合）──────────────────────────────────
const qps = seriesValues("qps");
const p50 = seriesValues("p50");
const queue = seriesValues("queue");
const cost = seriesValues("cost");

const lastQps = qps[qps.length - 1] ?? 0;
const lastP50 = p50[p50.length - 1] ?? 0;
const lastQueue = queue[queue.length - 1] ?? 0;
const lastCost = cost[cost.length - 1] ?? 0;

const inFlight = TASKS.filter((t) => t.status === "running" || t.status === "at-risk").length;
const failedCount = TASKS.filter((t) => t.status === "failed").length;
const failRate = (failedCount / Math.max(1, TASKS.length)) * 100;
// SLA 达成率：对有 elapsedMs 的任务评估
const slaSamples = TASKS.filter((t) => typeof t.elapsedMs === "number");
const slaMet = slaSamples.filter(
  (t) => evaluateSla(t.elapsedMs as number, t.slaMs).status !== "violated",
).length;
const slaRate = (slaMet / Math.max(1, slaSamples.length)) * 100;

// 时序图数据（队列深度 + 成本）
const trendData = METRICS[0].points.map((p, i) => ({
  t: p.t,
  queue: queue[i] ?? 0,
  cost: cost[i] ?? 0,
}));

// 临期/失败任务摘要（用于告警 Banner）
const atRiskCount = TASKS.filter((t) => t.status === "at-risk").length;

export default function OverviewPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-4 p-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">{copy("overallDispatchOverview")}</h1>
        <p className="text-sm text-muted-foreground">{copy("fullLinkSchedulingStatusHeterogeneousTaskIntelligent")}</p>
      </div>

      {(atRiskCount > 0 || failedCount > 0) && (
        <Banner
          tone="warning"
          icon={<AlertTriangle className="size-4" />}
          action={
            <Button size="sm" variant="outline" onClick={() => router.push(`${ROOT}/alerts`)}>{copy("checkTheAlert")}</Button>
          }
        >{copy("currently")}{atRiskCount}{copy("taskSlaIsNear")}{failedCount}{copy("taskExecutionFailedCurrentCost")}{lastCost}{copy("approachingBudgetThresholdsPayAttentionToScheduling")}</Banner>
      )}

      {/* KPI 卡 */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        <Card>
          <CardBody>
            <Stat
              icon={<ListChecks className="size-4" />}
              label={copy("missionsOnTheWay")}
              value={<NumberTicker value={inFlight} />}
              delta={6.2}
            />
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Stat
              icon={<Activity className="size-4" />}
              label={copy("throughputQps")}
              value={<NumberTicker value={lastQps} />}
              delta={9.1}
            />
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Stat
              icon={<Clock className="size-4" />}
              label={copy("averageLatency")}
              value={
                <span className="tabular-nums">
                  <NumberTicker value={lastP50} /> ms
                </span>
              }
              delta={-4.3}
            />
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Stat
              icon={<ShieldCheck className="size-4" />}
              label={copy("slaAchievementRate")}
              value={<span className="tabular-nums">{slaRate.toFixed(1)}%</span>}
              delta={0.8}
            />
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Stat
              icon={<XCircle className="size-4" />}
              label={copy("failureRate")}
              value={<span className="tabular-nums">{failRate.toFixed(1)}%</span>}
              delta={-1.2}
            />
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Stat
              icon={<Coins className="size-4" />}
              label={copy("costAtTheTime")}
              value={
                <span className="tabular-nums">
                  ¥<NumberTicker value={lastCost} />
                </span>
              }
              delta={3.4}
            />
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        {/* 任务漏斗 */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <span className="font-medium text-foreground">{copy("taskProcessingFunnel")}</span>
            <span className="text-xs text-muted-foreground">{copy("incomingRoutingExecutesComplete")}</span>
          </CardHeader>
          <CardBody>
            <Funnel
              stages={FUNNEL_STAGES}
              orientation="vertical"
              showConversion
              ariaLabel={copy("funnelChart")}
              conversionLabel={copy("conversion")}
            />
          </CardBody>
        </Card>

        {/* 队列/成本时序 */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex items-center justify-between">
            <span className="font-medium text-foreground">{copy("hQueueDepthCostTrends")}</span>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Gauge className="size-3.5" />{copy("p95Peak")}{Math.max(...seriesValues("p95"))}ms
              </span>
            </div>
          </CardHeader>
          <CardBody className="flex flex-col gap-3">
            <AreaChart
              data={trendData}
              xKey="t"
              series={[
                { key: "queue", label: copy("queueDepthBar") },
                { key: "cost", label: copy("costH") },
              ]}
              height={200}
            />
            {/* 内联趋势群 */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                { key: "qps", label: copy("throughputQps2"), last: lastQps, tone: "var(--color-primary)" },
                { key: "p50", label: copy("p50Latency"), last: lastP50, tone: "var(--color-chart-2)" },
                { key: "queue", label: copy("queueDepth"), last: lastQueue, tone: "var(--color-warning)" },
                { key: "cost", label: copy("costAtTheTime2"), last: lastCost, tone: "var(--color-chart-4)" },
              ].map((m) => (
                <div
                  key={m.key}
                  className="flex flex-col gap-1 rounded-[var(--radius)] border border-border bg-surface px-3 py-2"
                >
                  <span className="text-xs text-muted-foreground">{m.label}</span>
                  <span className="text-sm font-semibold tabular-nums text-foreground">
                    {m.last}
                  </span>
                  <Sparkline
                    data={seriesValues(m.key)}
                    variant="line"
                    tone={m.tone}
                    highlightLast
                    width={140}
                    height={24}
                  />
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* 执行器负载概览 */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <span className="font-medium text-foreground">{copy("overviewOfActuatorLoad")}</span>
          <Button size="sm" variant="ghost" onClick={() => router.push(`${ROOT}/agents`)}>{copy("actuatorPool")}</Button>
        </CardHeader>
        <CardBody>
          <OverviewLoadGrid executors={EXECUTORS} />
        </CardBody>
      </Card>

      {/* 最近任务流 */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <span className="font-medium text-foreground">{copy("realTimeTaskFlow")}</span>
          <Button size="sm" variant="ghost" onClick={() => router.push(`${ROOT}/queue`)}>{copy("taskQueue")}</Button>
        </CardHeader>
        <CardBody>
          <OverviewTaskFlow tasks={TASKS.slice(0, 8)} />
        </CardBody>
      </Card>
    </div>
  );
}
