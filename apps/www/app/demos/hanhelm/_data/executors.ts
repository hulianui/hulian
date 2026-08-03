import { copy } from "./executors.content";
// 执行器池（mock）：4 个底层大模型 + 5 个封装 agent。
// 价位 grounded（美元官方价折人民币展示，汇率按 7.0 估算，¥/1k tokens）：
//   Haiku 4.5  $1/$5   → ¥0.007 / ¥0.035
//   Sonnet 4.6 $3/$15  → ¥0.021 / ¥0.105
//   Opus 4.7   $5/$25  → ¥0.035 / ¥0.175
//   DeepSeek V4 $0.55/$2.2 → ¥0.0039 / ¥0.0154
// agent 价位按其底座模型 + 工具开销估算（略高于裸模型）。

import type { Executor } from "./types";

export const EXECUTORS: Executor[] = [
  // ── 大模型 ──────────────────────────────────────────────
  {
    id: "haiku-4-5",
    name: "Haiku 4.5",
    kind: "model",
    vendor: copy("anthropicExtremelyFastAndLightweight"),
    capabilities: ["text", "translate", "extract"],
    pricePer1kIn: 0.007,
    pricePer1kOut: 0.035,
    latencyMs: 420,
    maxConcurrency: 80,
    load: 0.32,
    health: "healthy",
    fallbackChain: ["deepseek-v4", "sonnet-4-6"],
  },
  {
    id: "sonnet-4-6",
    name: "Sonnet 4.6",
    kind: "model",
    vendor: copy("anthropicBalanceTheMainForce"),
    capabilities: ["text", "code", "translate", "rag", "extract", "moderate"],
    pricePer1kIn: 0.021,
    pricePer1kOut: 0.105,
    latencyMs: 980,
    maxConcurrency: 40,
    load: 0.58,
    health: "healthy",
    fallbackChain: ["opus-4-7", "haiku-4-5"],
  },
  {
    id: "opus-4-7",
    name: "Opus 4.7",
    kind: "model",
    vendor: copy("anthropicFlagshipReasoning"),
    capabilities: ["text", "code", "rag", "extract", "moderate", "orchestrate"],
    pricePer1kIn: 0.035,
    pricePer1kOut: 0.175,
    latencyMs: 1900,
    maxConcurrency: 16,
    load: 0.71,
    health: "healthy",
    fallbackChain: ["sonnet-4-6"],
  },
  {
    id: "deepseek-v4",
    name: "DeepSeek V4",
    kind: "model",
    vendor: copy("inDepthExplorationUltraLowCost"),
    capabilities: ["text", "code", "translate", "extract"],
    pricePer1kIn: 0.0039,
    pricePer1kOut: 0.0154,
    latencyMs: 1200,
    maxConcurrency: 60,
    load: 0.44,
    health: "degraded",
    fallbackChain: ["haiku-4-5", "sonnet-4-6"],
  },
  // ── 视觉模型 ────────────────────────────────────────────
  {
    id: "vision-flux",
    name: copy("coralPictureScrollFlux"),
    kind: "model",
    vendor: copy("imageGenerationHighFidelity"),
    capabilities: ["image"],
    pricePer1kIn: 0.06,
    pricePer1kOut: 0.18,
    latencyMs: 4200,
    maxConcurrency: 8,
    load: 0.5,
    health: "healthy",
    fallbackChain: [],
  },
  // ── 封装 agent ──────────────────────────────────────────
  {
    id: "rag-agent",
    name: copy("retrievalEnhancementAgent"),
    kind: "agent",
    vendor: copy("ragVectorLibraryRearrangement"),
    capabilities: ["rag", "text", "extract"],
    pricePer1kIn: 0.028,
    pricePer1kOut: 0.12,
    latencyMs: 1500,
    maxConcurrency: 24,
    load: 0.49,
    health: "healthy",
    fallbackChain: ["sonnet-4-6", "opus-4-7"],
  },
  {
    id: "moderate-agent",
    name: copy("contentReviewAgent"),
    kind: "agent",
    vendor: copy("complianceReviewMultipleStrategiesRunInParallel"),
    capabilities: ["moderate", "text", "extract"],
    pricePer1kIn: 0.018,
    pricePer1kOut: 0.08,
    latencyMs: 760,
    maxConcurrency: 50,
    load: 0.66,
    health: "healthy",
    fallbackChain: ["sonnet-4-6"],
  },
  {
    id: "orchestrate-agent",
    name: copy("orchestrationAndSchedulingAgents"),
    kind: "agent",
    vendor: copy("multiAgentOrchestrationPlanExecuteSummarize"),
    capabilities: ["orchestrate", "text", "code", "rag"],
    pricePer1kIn: 0.04,
    pricePer1kOut: 0.2,
    latencyMs: 2600,
    maxConcurrency: 12,
    load: 0.38,
    health: "healthy",
    fallbackChain: ["opus-4-7"],
  },
  {
    id: "extract-agent",
    name: copy("structuredExtractionOfAgents"),
    kind: "agent",
    vendor: copy("documentExtractionTableFieldParsing"),
    capabilities: ["extract", "text", "translate"],
    pricePer1kIn: 0.012,
    pricePer1kOut: 0.05,
    latencyMs: 880,
    maxConcurrency: 36,
    load: 0.55,
    health: "healthy",
    fallbackChain: ["haiku-4-5", "sonnet-4-6"],
  },
];

/** 按 id 取执行器。 */
export function executorById(id: string | null | undefined): Executor | undefined {
  if (!id) return undefined;
  return EXECUTORS.find((e) => e.id === id);
}

/** 执行器名（兜底回 id）。 */
export function executorName(id: string | null | undefined): string {
  return executorById(id)?.name ?? (id ?? "—");
}

/** 健康度 → 健康 map（供 failover）。 */
export const EXECUTOR_HEALTH_MAP: Record<string, import("./types").ExecutorHealth> =
  Object.fromEntries(EXECUTORS.map((e) => [e.id, e.health]));
