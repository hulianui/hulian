"use client";
// 执行器池 · 单个执行器卡：能力 / 价位 / 延迟 / 并发 / 当前负载 ScoreRing / 健康 / 负载趋势 / 降级链 / 启停限流。
import { useState } from "react";
import { ArrowRight, Cpu, Bot } from "lucide-react";
import {
  Card,
  CardBody,
  CardHeader,
  NumberField,
  ScoreRing,
  Sparkline,
  StatusDot,
  Switch,
  Tag,
} from "@hulian/ui";
import type { Capability, Executor, ExecutorHealth } from "../_data/types";
import { executorName } from "../_data/executors";
import { seriesValues } from "../_data/metrics";

const HEALTH_STATUS: Record<ExecutorHealth, "online" | "degraded" | "offline"> = {
  healthy: "online",
  degraded: "degraded",
  offline: "offline",
};
const HEALTH_LABEL: Record<ExecutorHealth, string> = {
  healthy: "健康",
  degraded: "降级",
  offline: "离线",
};

const CAP_LABEL: Record<Capability, string> = {
  text: "文本",
  code: "代码",
  image: "图像",
  translate: "翻译",
  rag: "检索增强",
  extract: "抽取",
  moderate: "审核",
  orchestrate: "编排",
};

// 负载等级带（高负载红）。
const LOAD_GRADES = [
  { min: 0, label: "富余", tone: "var(--success)" },
  { min: 50, label: "适中", tone: "var(--chart-2)" },
  { min: 75, label: "偏高", tone: "var(--warning)" },
  { min: 90, label: "饱和", tone: "var(--danger)" },
];

function loadTrend(index: number): number[] {
  const base = seriesValues("queue");
  const start = (index * 4) % Math.max(1, base.length - 8);
  return base.slice(start, start + 8);
}

export function AgentsExecutorCard({ executor, index }: { executor: Executor; index: number }) {
  const e = executor;
  const [enabled, setEnabled] = useState(e.health !== "offline");
  const [concurrency, setConcurrency] = useState<number | null>(e.maxConcurrency);
  const loadPct = Math.round(e.load * 100);

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="grid size-8 shrink-0 place-items-center rounded-[var(--radius)] bg-muted text-foreground">
            {e.kind === "agent" ? <Bot className="size-4" /> : <Cpu className="size-4" />}
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="truncate text-sm font-semibold text-foreground">{e.name}</span>
              <Tag size="sm" tone={e.kind === "agent" ? "brand" : "neutral"} variant="soft">
                {e.kind === "agent" ? "Agent" : "模型"}
              </Tag>
            </div>
            {e.vendor && <div className="truncate text-xs text-muted">{e.vendor}</div>}
          </div>
        </div>
        <StatusDot status={HEALTH_STATUS[e.health]} label={HEALTH_LABEL[e.health]} size="sm" />
      </CardHeader>

      <CardBody className="flex flex-1 flex-col gap-3">
        {/* 负载环 + 趋势 */}
        <div className="flex items-center gap-3">
          <ScoreRing
            value={loadPct}
            grades={LOAD_GRADES}
            size={76}
            thickness={7}
            label="当前负载"
          />
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center justify-between text-xs text-muted">
              <span>负载趋势</span>
              <span className="tabular-nums">
                并发 {Math.round(e.load * e.maxConcurrency)}/{e.maxConcurrency}
              </span>
            </div>
            <Sparkline
              data={loadTrend(index)}
              variant="area"
              tone={
                loadPct >= 90
                  ? "var(--danger)"
                  : loadPct >= 75
                    ? "var(--warning)"
                    : "var(--primary)"
              }
              width={160}
              height={36}
              className="w-full"
            />
          </div>
        </div>

        {/* 能力标 */}
        <div className="flex flex-wrap gap-1">
          {e.capabilities.map((c) => (
            <Tag key={c} size="sm" tone="neutral" variant="outline">
              {CAP_LABEL[c]}
            </Tag>
          ))}
        </div>

        {/* 价位 / 延迟 / 并发 */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-[var(--radius)] border border-border bg-surface px-2 py-1.5">
            <div className="text-[11px] text-muted">入/出价</div>
            <div className="text-xs font-medium tabular-nums text-foreground">
              ¥{e.pricePer1kIn}/{e.pricePer1kOut}
            </div>
          </div>
          <div className="rounded-[var(--radius)] border border-border bg-surface px-2 py-1.5">
            <div className="text-[11px] text-muted">典型延迟</div>
            <div className="text-xs font-medium tabular-nums text-foreground">{e.latencyMs}ms</div>
          </div>
          <div className="rounded-[var(--radius)] border border-border bg-surface px-2 py-1.5">
            <div className="text-[11px] text-muted">最大并发</div>
            <div className="text-xs font-medium tabular-nums text-foreground">
              {e.maxConcurrency}
            </div>
          </div>
        </div>

        {/* 降级链 */}
        <div className="rounded-[var(--radius)] border border-border bg-muted/30 px-3 py-2">
          <div className="mb-1 text-[11px] text-muted">降级链</div>
          {e.fallbackChain.length === 0 ? (
            <span className="text-xs text-muted">无（唯一能力执行器）</span>
          ) : (
            <div className="flex flex-wrap items-center gap-1 text-xs text-foreground">
              <Tag size="sm" tone="brand" variant="soft">
                {e.name}
              </Tag>
              {e.fallbackChain.map((id) => (
                <span key={id} className="inline-flex items-center gap-1">
                  <ArrowRight className="size-3 text-muted" />
                  <Tag size="sm" tone="neutral" variant="soft">
                    {executorName(id)}
                  </Tag>
                </span>
              ))}
            </div>
          )}
        </div>
      </CardBody>

      {/* 启停 / 限流 */}
      <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-2.5">
        <label className="flex items-center gap-2 text-xs text-foreground">
          <Switch
            checked={enabled}
            onCheckedChange={setEnabled}
            aria-label={`启停 ${e.name}`}
          />
          {enabled ? "已启用" : "已停用"}
        </label>
        <label className="flex items-center gap-2 text-xs text-muted">
          并发上限
          <NumberField
            value={concurrency}
            onValueChange={setConcurrency}
            min={1}
            max={200}
            step={1}
            disabled={!enabled}
            aria-label={`${e.name} 并发上限`}
            className="w-24"
          />
        </label>
      </div>
    </Card>
  );
}
