"use client";
import { copy } from "./page.content";

import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  Coins,
  GaugeCircle,
  ShieldCheck,
} from "lucide-react";
import {
  AreaChart,
  Banner,
  Card,
  CardBody,
  CardHeader,
  Heatmap,
  List,
  ListItem,
  Meter,
  NumberTicker,
  PieChart,
  ScoreRing,
  Stat,
  StatusDot,
  Tag,
} from "@hulianui/ui";
import type { ChannelStatus } from "@hulianui/ui";
import { COST_TREND, HOTSPOT, MODEL_USAGE, QUALITY_TREND, SEVERITY_DIST } from "../_data/metrics";
import { MODELS } from "../_data/models";
import { REPOS } from "../_data/repos";
import { REVIEWS } from "../_data/reviews";
import type { Review, ReviewStatus, Severity } from "../_data/types";

// ── 名称查找表 ──────────────────────────────────────────────
const repoName = (id: string) => REPOS.find((r) => r.id === id)?.name ?? id;
const modelName = (id: string) => MODELS.find((m) => m.id === id)?.name ?? id;

// status → StatusDot 健康态映射。
const statusDot: Record<ReviewStatus, ChannelStatus> = {
  done: "online",
  reviewing: "maintenance",
  failed: "offline",
  queued: "degraded",
};
const statusLabel: Record<ReviewStatus, string> = {
  done: copy("completed"),
  reviewing: copy("underReview"),
  failed: copy("failure"),
  queued: copy("inLine"),
};

const severityLabel: Record<Severity, string> = {
  critical: copy("serious"),
  major: copy("important"),
  minor: copy("secondary"),
  info: copy("tip"),
};

// 质量分 → Tag 语气色。
function scoreTone(score: number) {
  if (score >= 85) return "success" as const;
  if (score >= 70) return "warning" as const;
  return "danger" as const;
}

// ── 派生 KPI（确定性，从 mock 直接算）──────────────────────
const weekReviews = REVIEWS.length;
const avgScore = Math.round(REVIEWS.reduce((a, r) => a + r.score, 0) / REVIEWS.length);
const openIssues = SEVERITY_DIST.reduce((a, s) => a + s.count, 0);
const gatePassRate = Math.round(
  (REVIEWS.filter((r) => r.gate === "pass").length / REVIEWS.length) * 100,
);

// 严重度分布喂 PieChart。
const severityPie = SEVERITY_DIST.map((s) => ({ name: severityLabel[s.severity], value: s.count }));

// AI 成本占比（Meter 用）。
const maxModelCost = Math.max(...MODEL_USAGE.map((m) => m.cost));

// 最近审查流（前 6 条）。
const recentReviews: Review[] = REVIEWS.slice(0, 6);

export default function HanReviewOverviewPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground">{copy("overview")}</h1>
        <p className="text-sm text-muted">{copy("aiCodeReviewStatusAsOf")}</p>
      </div>

      {/* 预算提示 */}
      <Banner tone="info" icon={<Coins className="size-4" />}>{copy("ofTheAiReviewBudgetHasAlready")}</Banner>

      {/* KPI 四卡 */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card>
          <CardBody>
            <Stat
              icon={<Activity className="size-4" />}
              label={copy("numberOfReviewsThisWeek")}
              value={<NumberTicker value={weekReviews} />}
              delta={12.5}
            />
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="flex items-center justify-between gap-3">
              <Stat
                icon={<GaugeCircle className="size-4" />}
                label={copy("averageMassScore")}
                value={<NumberTicker value={avgScore} />}
                delta={2.4}
              />
              <ScoreRing value={avgScore} size={44} showGrade={false} />
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Stat
              icon={<AlertTriangle className="size-4" />}
              label={copy("issuesToBeAddressed")}
              value={<NumberTicker value={openIssues} />}
              delta={-6.1}
            />
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Stat
              icon={<ShieldCheck className="size-4" />}
              label={copy("accessControlClearanceRate")}
              value={
                <span className="tabular-nums">
                  <NumberTicker value={gatePassRate} />%
                </span>
              }
              delta={1.8}
            />
          </CardBody>
        </Card>
      </div>

      {/* 趋势 + 严重度分布 */}
      <div className="grid gap-3 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex items-center justify-between">
            <span className="font-medium text-foreground">{copy("qualityTrendNearlyDays")}</span>
            <span className="text-xs text-muted">{copy("maximumScore")}</span>
          </CardHeader>
          <CardBody>
            <AreaChart
              data={QUALITY_TREND}
              xKey="date"
              series={[{ key: "score", label: copy("qualityPoints") }]}
              height={220}
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="font-medium text-foreground">{copy("distributionOfProblemSeverity")}</CardHeader>
          <CardBody className="grid place-items-center">
            <PieChart data={severityPie} donut height={220} />
          </CardBody>
        </Card>
      </div>

      {/* 代码热点 + AI 成本 */}
      <div className="grid gap-3 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex items-center justify-between">
            <span className="font-medium text-foreground">{copy("codeHotspotsModulesWeeks")}</span>
            <span className="text-xs text-muted">{copy("theHigherTheValueTheMoreNumerous")}</span>
          </CardHeader>
          <CardBody className="overflow-x-auto">
            <Heatmap
              data={HOTSPOT}
              cellSize={18}
              formatTooltip={(c) => copy("valueValueValueQuestions", c.y, c.x, c.value)}
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="font-medium text-foreground">{copy("aiReviewCostsThisMonth")}</CardHeader>
          <CardBody>
            <List
              items={MODEL_USAGE}
              renderItem={(m) => (
                <ListItem key={m.modelId}>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <span className="truncate font-medium text-foreground">
                        {modelName(m.modelId)}
                      </span>
                      <span className="flex shrink-0 items-center gap-2 text-xs text-muted">
                        <span className="tabular-nums">{m.calls}{copy("times")}</span>
                        <span className="tabular-nums font-medium text-foreground">
                          ¥{m.cost.toFixed(2)}
                        </span>
                      </span>
                    </div>
                    <Meter value={m.cost} max={maxModelCost} />
                  </div>
                </ListItem>
              )}
            />
          </CardBody>
        </Card>
      </div>

      {/* 最近审查流 */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <span className="font-medium text-foreground">{copy("recentReview")}</span>
          <Link href="/demos/hanreview/reviews" className="text-xs text-primary hover:underline">{copy("viewAll")}</Link>
        </CardHeader>
        <CardBody>
          <List
            items={recentReviews}
            renderItem={(r) => (
              <ListItem
                key={r.id}
                className={r.gate === "block" ? "bg-danger/5" : undefined}
              >
                <Link
                  href={`/demos/hanreview/reviews/${r.id}`}
                  className="flex items-center justify-between gap-3"
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <StatusDot status={statusDot[r.status]} />
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-foreground">{r.title}</div>
                      <div className="truncate text-xs text-muted">
                        {repoName(r.repoId)} · {r.branch} · {r.author.name} · {statusLabel[r.status]}
                      </div>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Tag tone={scoreTone(r.score)}>{r.score}{copy("points")}</Tag>
                    {r.gate === "pass" ? (
                      <Tag tone="success">{copy("pass")}</Tag>
                    ) : (
                      <Tag tone="danger">{copy("blocking")}</Tag>
                    )}
                  </div>
                </Link>
              </ListItem>
            )}
          />
        </CardBody>
      </Card>
    </div>
  );
}
