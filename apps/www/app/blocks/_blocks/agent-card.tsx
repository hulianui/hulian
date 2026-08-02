/** @jsxImportSource ../../../lib/fixture-jsx */
"use client";

// 智能体卡片网格 Block —— 自包含、可整段复制。
// 每张卡：名称 + 头像 + 能力 Tag + 健康 StatusDot + 负载 ScoreRing + 趋势 Sparkline + 启用 Switch。
// 数据全内联，复制后直接修改 AGENTS 数组即可。

import { useState } from "react";
import {
  Avatar,
  Card,
  CardBody,
  Heading,
  ScoreRing,
  Sparkline,
  StatusDot,
  Switch,
  Tag,
  Text,
  toast,
} from "../../../lib/fixture-ui";
import { Bot, Cpu } from "lucide-react";

// ── mock 数据 ──────────────────────────────────────────────────
type Health = "healthy" | "degraded" | "offline";

interface AgentData {
  id: string;
  name: string;
  vendor: string;
  kind: "agent" | "model";
  health: Health;
  loadPct: number; // 0-100
  trend: number[]; // Sparkline 数据点
  capabilities: string[];
  latencyMs: number;
}

const AGENTS: AgentData[] = [
  {
    id: "a1",
    name: "瑚琏 Orchestrator",
    vendor: "hulianui · 编排主控",
    kind: "agent",
    health: "healthy",
    loadPct: 42,
    trend: [18, 25, 31, 28, 42, 38, 42],
    capabilities: ["编排", "路由", "监控"],
    latencyMs: 38,
  },
  {
    id: "a2",
    name: "Claude Sonnet 4",
    vendor: "Anthropic · 通用推理",
    kind: "model",
    health: "healthy",
    loadPct: 77,
    trend: [40, 55, 62, 70, 75, 72, 77],
    capabilities: ["文本", "代码", "推理"],
    latencyMs: 210,
  },
  {
    id: "a3",
    name: "检索增强 Agent",
    vendor: "内部 · RAG 专项",
    kind: "agent",
    health: "degraded",
    loadPct: 91,
    trend: [60, 72, 80, 88, 85, 90, 91],
    capabilities: ["检索", "抽取", "摘要"],
    latencyMs: 540,
  },
];

// ── 负载颜色档位 ────────────────────────────────────────────
const LOAD_GRADES = [
  { min: 0, label: "富余", tone: "var(--color-success)" },
  { min: 50, label: "适中", tone: "var(--color-chart-2)" },
  { min: 75, label: "偏高", tone: "var(--color-warning)" },
  { min: 90, label: "饱和", tone: "var(--color-danger)" },
];

const HEALTH_STATUS: Record<Health, "online" | "degraded" | "offline"> = {
  healthy: "online",
  degraded: "degraded",
  offline: "offline",
};
const HEALTH_LABEL: Record<Health, string> = {
  healthy: "健康",
  degraded: "降级",
  offline: "离线",
};

function sparklineTone(loadPct: number): string {
  if (loadPct >= 90) return "var(--color-danger)";
  if (loadPct >= 75) return "var(--color-warning)";
  return "var(--color-primary)";
}

// ── 单张卡片 ─────────────────────────────────────────────────
function AgentCard({ agent }: { agent: AgentData }) {
  const [enabled, setEnabled] = useState(agent.health !== "offline");

  const handleToggle = (checked: boolean) => {
    setEnabled(checked);
    toast({
      title: checked ? `${agent.name} 已启用` : `${agent.name} 已停用`,
      tone: checked ? "info" : "neutral",
    });
  };

  return (
    <Card className="flex flex-col">
      {/* 卡头：头像 + 名称 + 健康点 */}
      <div className="flex items-start justify-between gap-2 px-4 pt-4 pb-0">
        <div className="flex min-w-0 items-center gap-2.5">
          <Avatar
            size="sm"
            fallback={agent.kind === "agent" ? <Bot className="size-4" /> : <Cpu className="size-4" />}
            className="shrink-0 bg-surface-hover"
          />
          <div className="min-w-0">
            <Heading level={3} size="sm" weight="semibold" className="truncate text-foreground">
              {agent.name}
            </Heading>
            <Text as="p" size="xs" tone="muted" className="truncate">
              {agent.vendor}
            </Text>
          </div>
        </div>
        <StatusDot
          status={HEALTH_STATUS[agent.health]}
          label={HEALTH_LABEL[agent.health]}
          size="sm"
        />
      </div>

      <CardBody className="flex flex-1 flex-col gap-3 pt-3">
        {/* 负载环 + 趋势 */}
        <div className="flex items-center gap-3">
          <ScoreRing
            value={agent.loadPct}
            grades={LOAD_GRADES}
            size={72}
            thickness={7}
            label="当前负载"
          />
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center justify-between text-xs text-muted">
              <span>负载趋势</span>
              <span className="tabular-nums font-medium text-foreground">{agent.loadPct}%</span>
            </div>
            <Sparkline
              data={agent.trend}
              variant="area"
              tone={sparklineTone(agent.loadPct)}
              width={160}
              height={32}
              className="w-full"
            />
          </div>
        </div>

        {/* 能力标签 */}
        <div className="flex flex-wrap gap-1">
          {agent.capabilities.map((cap) => (
            <Tag key={cap} size="sm" tone="neutral" variant="outline">
              {cap}
            </Tag>
          ))}
          <Tag size="sm" tone={agent.kind === "agent" ? "brand" : "neutral"} variant="soft">
            {agent.kind === "agent" ? "Agent" : "模型"}
          </Tag>
        </div>

        {/* 延迟数据 */}
        <div className="rounded-lg border border-border bg-surface px-3 py-2 text-center">
          <Text as="p" size="xs" tone="muted">
            典型延迟
          </Text>
          <Text as="p" size="sm" weight="semibold" className="tabular-nums text-foreground">
            {agent.latencyMs} ms
          </Text>
        </div>
      </CardBody>

      {/* 启用开关 */}
      <div className="flex items-center justify-between border-t border-border px-4 py-2.5">
        <label className="flex cursor-pointer items-center gap-2 text-xs text-foreground">
          <Switch
            checked={enabled}
            onCheckedChange={handleToggle}
            aria-label={`启停 ${agent.name}`}
          />
          {enabled ? "已启用" : "已停用"}
        </label>
        <Text as="span" size="xs" tone="muted">
          并发 {Math.round((agent.loadPct / 100) * 32)}/32
        </Text>
      </div>
    </Card>
  );
}

// ── 区块主体 ─────────────────────────────────────────────────
export function AgentCardBlock() {
  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {AGENTS.map((agent) => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>
    </div>
  );
}
