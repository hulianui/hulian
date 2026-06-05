"use client";
// 瀚舵 HanHelm · SLA 告警
//   1) 顶部 KPI：触发/已确认/已解决 告警数 + 当前 P95。
//   2) SLA 达成监控：各任务类别 P50/P95 vs SLA 阈值（Sparkline 趋势 + evaluateSla 染色）。
//   3) 告警模拟器：拖 P95 阈值 Slider → 实时算「近 24 时刻会触发 M 次」（percentile 纯函数）。
//   4) 告警规则：ALERT_RULES 列表（Switch 启停 + 渠道 Choicebox + 严重级 Tag）。
//   5) 告警事件流：ALERT_EVENTS → Timeline（按严重级染色 + 处置状态 Tag）。
import { useMemo, useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  PageHeader,
  Slider,
  Sparkline,
  Stat,
  Switch,
  Tag,
  Timeline,
  Choicebox,
  ChoiceboxGroup,
  type TimelineItemProps,
} from "@hulian/ui";
import { BellRing, BellOff, CheckCircle2, Activity } from "lucide-react";
import { ALERT_EVENTS, ALERT_RULES } from "../../_data/alerts";
import { seriesValues } from "../../_data/metrics";
import { evaluateSla, percentile } from "../../_lib/sla";
import type { AlertSeverity } from "../../_data/types";

const SEVERITY_TONE: Record<AlertSeverity, "danger" | "warning" | "brand"> = {
  critical: "danger",
  warning: "warning",
  info: "brand",
};
const SEVERITY_LABEL: Record<AlertSeverity, string> = {
  critical: "严重",
  warning: "警告",
  info: "提示",
};
const STATUS_LABEL: Record<"firing" | "acked" | "resolved", string> = {
  firing: "触发中",
  acked: "已确认",
  resolved: "已解决",
};
const STATUS_TONE: Record<"firing" | "acked" | "resolved", "danger" | "warning" | "success"> = {
  firing: "danger",
  acked: "warning",
  resolved: "success",
};

// 各任务类别的 P50/P95（ms）vs SLA 阈值（ms）—— 近 24 时刻聚合，供达成监控。
const SLA_CATEGORIES = [
  { label: "合同/文档翻译", p50: 820, p95: 1680, slaMs: 5000, trend: "p50" },
  { label: "代码生成/审查", p50: 2100, p95: 4200, slaMs: 8000, trend: "p95" },
  { label: "RAG 检索问答", p50: 1450, p95: 3100, slaMs: 4000, trend: "p95" },
  { label: "实时内容审核", p50: 18000, p95: 27500, slaMs: 30000, trend: "p95" },
  { label: "结构化抽取", p50: 950, p95: 2300, slaMs: 6000, trend: "p50" },
  { label: "多 agent 编排", p50: 9800, p95: 22000, slaMs: 60000, trend: "p95" },
] as const;

export default function AlertsPage() {
  const p95Series = useMemo(() => seriesValues("p95"), []);
  const queueSeries = useMemo(() => seriesValues("queue"), []);

  // 告警模拟器：P95 阈值 → 近 24 时刻超阈次数 + 当前分位。
  const [p95Threshold, setP95Threshold] = useState(2500);
  const exceedCount = useMemo(
    () => p95Series.filter((v) => v > p95Threshold).length,
    [p95Series, p95Threshold],
  );
  const p95p95 = useMemo(() => Math.round(percentile(p95Series, 95)), [p95Series]);

  // 规则启停（演示态）。
  const [ruleEnabled, setRuleEnabled] = useState<Record<string, boolean>>(
    () => Object.fromEntries(ALERT_RULES.map((r) => [r.id, r.enabled])),
  );
  const [channels, setChannels] = useState<string[]>(["wecom", "sms"]);

  const firing = ALERT_EVENTS.filter((e) => e.status === "firing").length;
  const acked = ALERT_EVENTS.filter((e) => e.status === "acked").length;
  const resolved = ALERT_EVENTS.filter((e) => e.status === "resolved").length;

  const timelineItems: TimelineItemProps[] = ALERT_EVENTS.map((e) => ({
    color:
      e.severity === "critical" ? "danger" : e.severity === "warning" ? "warning" : "primary",
    label: `${e.at} · ${SEVERITY_LABEL[e.severity]}`,
    children: (
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">{e.title}</span>
          <Tag size="sm" variant="soft" tone={STATUS_TONE[e.status]}>
            {STATUS_LABEL[e.status]}
          </Tag>
        </div>
        <div className="text-xs text-muted">{e.detail}</div>
      </div>
    ),
  }));

  return (
    <div className="space-y-5 p-6">
      <PageHeader title="SLA 告警" subTitle="达成监控 · 模拟器 · 规则 · 事件流" />

      {/* 1) KPI */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card><CardBody><Stat label="触发中告警" value={firing} icon={<BellRing className="size-5" />} /></CardBody></Card>
        <Card><CardBody><Stat label="已确认" value={acked} icon={<BellOff className="size-5" />} /></CardBody></Card>
        <Card><CardBody><Stat label="已解决" value={resolved} icon={<CheckCircle2 className="size-5" />} /></CardBody></Card>
        <Card><CardBody><Stat label="当前 P95 延迟" value={`${p95p95}ms`} icon={<Activity className="size-5" />} /></CardBody></Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* 2) SLA 达成监控 */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="text-sm font-semibold text-foreground">SLA 达成监控</div>
            <div className="text-xs text-muted">各任务类别 P50 / P95 延迟 vs SLA 阈值（近 24 时刻）</div>
          </CardHeader>
          <CardBody className="space-y-2">
            <div className="grid grid-cols-[1.6fr_repeat(3,0.8fr)_auto] items-center gap-2 border-b border-border pb-1.5 text-xs text-muted">
              <span>任务类别</span><span className="text-right">P50</span><span className="text-right">P95</span><span className="text-right">SLA</span><span className="text-right">达成</span>
            </div>
            {SLA_CATEGORIES.map((c) => {
              const sla = evaluateSla(c.p95, c.slaMs);
              const tone = sla.status === "met" ? "success" : sla.status === "at-risk" ? "warning" : "danger";
              const label = sla.status === "met" ? "达成" : sla.status === "at-risk" ? "临期" : "违约";
              return (
                <div key={c.label} className="grid grid-cols-[1.6fr_repeat(3,0.8fr)_auto] items-center gap-2 text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="truncate text-foreground">{c.label}</span>
                    <Sparkline data={seriesValues(c.trend)} variant="area" width={56} height={18} tone="var(--color-primary)" />
                  </div>
                  <span className="text-right tabular-nums text-muted">{c.p50}ms</span>
                  <span className="text-right tabular-nums text-foreground">{c.p95}ms</span>
                  <span className="text-right tabular-nums text-muted">{c.slaMs}ms</span>
                  <span className="text-right"><Tag size="sm" variant="soft" tone={tone}>{label}</Tag></span>
                </div>
              );
            })}
          </CardBody>
        </Card>

        {/* 3) 告警模拟器 */}
        <Card>
          <CardHeader>
            <div className="text-sm font-semibold text-foreground">告警模拟器</div>
            <div className="text-xs text-muted">拖动 P95 阈值，实时预演触发次数</div>
          </CardHeader>
          <CardBody className="space-y-4">
            <div>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs text-muted">P95 延迟阈值</span>
                <Tag size="sm" variant="soft" tone="neutral">{p95Threshold}ms</Tag>
              </div>
              <Slider
                value={p95Threshold}
                min={1500}
                max={4000}
                step={50}
                onValueChange={(v) => setP95Threshold(Array.isArray(v) ? v[0] : v)}
                aria-label="P95 延迟阈值"
              />
            </div>
            <Sparkline data={p95Series} variant="bar" width={232} height={40} tone="var(--color-chart-3)" />
            <div className="rounded-[var(--radius)] border border-border bg-surface p-3 text-sm">
              按当前阈值 <span className="font-semibold tabular-nums text-foreground">{p95Threshold}ms</span>，
              近 24 时刻将触发 <span className="font-semibold tabular-nums text-danger">{exceedCount}</span> 次告警。
            </div>
            <div className="text-xs text-muted">
              峰值队列深度 {Math.max(...queueSeries)} 条 · 阈值越低越灵敏但噪声越多。
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* 4) 告警规则 */}
        <Card>
          <CardHeader>
            <div className="text-sm font-semibold text-foreground">告警规则</div>
            <div className="text-xs text-muted">阈值触发 → 通知渠道</div>
          </CardHeader>
          <CardBody className="space-y-2.5">
            {ALERT_RULES.map((r) => (
              <div key={r.id} className="flex items-start justify-between gap-3 rounded-[var(--radius)] border border-border p-3">
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{r.name}</span>
                    <Tag size="sm" variant="soft" tone={SEVERITY_TONE[r.severity]}>{SEVERITY_LABEL[r.severity]}</Tag>
                  </div>
                  <div className="text-xs text-muted">
                    当 <span className="text-foreground">{r.metric}</span> {r.op} {r.threshold}
                    {r.unit} · {r.channel}
                  </div>
                </div>
                <Switch
                  checked={ruleEnabled[r.id]}
                  onCheckedChange={(c) => setRuleEnabled((p) => ({ ...p, [r.id]: c }))}
                  aria-label={`${r.name} 启停`}
                />
              </div>
            ))}
            <div className="pt-1">
              <div className="mb-2 text-xs text-muted">默认通知渠道（多选）</div>
              <ChoiceboxGroup value={channels} onValueChange={(v) => setChannels(v as string[])} multiple columns={2}>
                <Choicebox value="wecom" title="企业微信" description="值班群实时推送" />
                <Choicebox value="sms" title="短信" description="严重级直达负责人" />
                <Choicebox value="email" title="邮件" description="成本/提交人通知" />
                <Choicebox value="phone" title="电话" description="P0 SLA 违约升级" />
              </ChoiceboxGroup>
            </div>
          </CardBody>
        </Card>

        {/* 5) 告警事件流 */}
        <Card>
          <CardHeader>
            <div className="text-sm font-semibold text-foreground">告警事件流</div>
            <div className="text-xs text-muted">最近触发的告警与处置</div>
          </CardHeader>
          <CardBody>
            <Timeline items={timelineItems} />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
