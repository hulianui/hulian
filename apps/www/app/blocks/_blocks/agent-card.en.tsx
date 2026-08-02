"use client";
import { useState } from "react";
import { Avatar, Card, CardBody, Heading, ScoreRing, Sparkline, StatusDot, Switch, Tag, Text, toast, } from "@hulianui/ui";
import { Bot, Cpu } from "lucide-react";
type Health = "healthy" | "degraded" | "offline";
interface AgentData {
    id: string;
    name: string;
    vendor: string;
    kind: "agent" | "model";
    health: Health;
    loadPct: number;
    trend: number[];
    capabilities: string[];
    latencyMs: number;
}
const AGENTS: AgentData[] = [
    {
        id: "a1",
        name: "Hulian Orchestrator",
        vendor: "hulianui \u00B7 Orchestrator",
        kind: "agent",
        health: "healthy",
        loadPct: 42,
        trend: [18, 25, 31, 28, 42, 38, 42],
        capabilities: ["Orchestration", "routing", "Monitor"],
        latencyMs: 38,
    },
    {
        id: "a2",
        name: "Claude Sonnet 4",
        vendor: "Anthropic \u00B7 Universal Reasoning",
        kind: "model",
        health: "healthy",
        loadPct: 77,
        trend: [40, 55, 62, 70, 75, 72, 77],
        capabilities: ["text", "code", "reasoning"],
        latencyMs: 210,
    },
    {
        id: "a3",
        name: "Retrieval-augmented agent",
        vendor: "Internal \u00B7 RAG initiative",
        kind: "agent",
        health: "degraded",
        loadPct: 91,
        trend: [60, 72, 80, 88, 85, 90, 91],
        capabilities: ["Search", "extract", "Summary"],
        latencyMs: 540,
    },
];
const LOAD_GRADES = [
    { min: 0, label: "surplus", tone: "var(--color-success)" },
    { min: 50, label: "Medium", tone: "var(--color-chart-2)" },
    { min: 75, label: "Elevated", tone: "var(--color-warning)" },
    { min: 90, label: "saturated", tone: "var(--color-danger)" },
];
const HEALTH_STATUS: Record<Health, "online" | "degraded" | "offline"> = {
    healthy: "online",
    degraded: "degraded",
    offline: "offline",
};
const HEALTH_LABEL: Record<Health, string> = {
    healthy: "health",
    degraded: "Downgrade",
    offline: "Offline",
};
function sparklineTone(loadPct: number): string {
    if (loadPct >= 90)
        return "var(--color-danger)";
    if (loadPct >= 75)
        return "var(--color-warning)";
    return "var(--color-primary)";
}
function AgentCard({ agent }: {
    agent: AgentData;
}) {
    const [enabled, setEnabled] = useState(agent.health !== "offline");
    const handleToggle = (checked: boolean) => {
        setEnabled(checked);
        toast({
            title: checked ? `${agent.name} Enabled` : `${agent.name} Deactivated`,
            tone: checked ? "info" : "neutral",
        });
    };
    return (<Card className="flex flex-col">

      <div className="flex items-start justify-between gap-2 px-4 pt-4 pb-0">
        <div className="flex min-w-0 items-center gap-2.5">
          <Avatar size="sm" fallback={agent.kind === "agent" ? <Bot className="size-4"/> : <Cpu className="size-4"/>} className="shrink-0 bg-surface-hover"/>
          <div className="min-w-0">
            <Heading level={3} size="sm" weight="semibold" className="truncate text-foreground">
              {agent.name}
            </Heading>
            <Text as="p" size="xs" tone="muted" className="truncate">
              {agent.vendor}
            </Text>
          </div>
        </div>
        <StatusDot status={HEALTH_STATUS[agent.health]} label={HEALTH_LABEL[agent.health]} size="sm"/>
      </div>

      <CardBody className="flex flex-1 flex-col gap-3 pt-3">

        <div className="flex items-center gap-3">
          <ScoreRing value={agent.loadPct} grades={LOAD_GRADES} size={72} thickness={7} label="Current load"/>
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center justify-between text-xs text-muted">
              <span>Load trend</span>
              <span className="tabular-nums font-medium text-foreground">{agent.loadPct}%</span>
            </div>
            <Sparkline data={agent.trend} variant="area" tone={sparklineTone(agent.loadPct)} width={160} height={32} className="w-full"/>
          </div>
        </div>


        <div className="flex flex-wrap gap-1">
          {agent.capabilities.map((cap) => (<Tag key={cap} size="sm" tone="neutral" variant="outline">
              {cap}
            </Tag>))}
          <Tag size="sm" tone={agent.kind === "agent" ? "brand" : "neutral"} variant="soft">
            {agent.kind === "agent" ? "Agent" : "Model"}
          </Tag>
        </div>


        <div className="rounded-lg border border-border bg-surface px-3 py-2 text-center">
          <Text as="p" size="xs" tone="muted">
            Typical latency
          </Text>
          <Text as="p" size="sm" weight="semibold" className="tabular-nums text-foreground">
            {agent.latencyMs} ms
          </Text>
        </div>
      </CardBody>


      <div className="flex items-center justify-between border-t border-border px-4 py-2.5">
        <label className="flex cursor-pointer items-center gap-2 text-xs text-foreground">
          <Switch checked={enabled} onCheckedChange={handleToggle} aria-label={`Toggle ${agent.name}`}/>
          {enabled ? "Enabled" : "Deactivated"}
        </label>
        <Text as="span" size="xs" tone="muted">
          Concurrency {Math.round((agent.loadPct / 100) * 32)}/32
        </Text>
      </div>
    </Card>);
}
export function AgentCardBlock() {
    return (<div className="mx-auto w-full max-w-4xl">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {AGENTS.map((agent) => (<AgentCard key={agent.id} agent={agent}/>))}
      </div>
    </div>);
}
