import { copy } from "./metrics.content";
// 时序指标 + 桑基流向（mock）。供 Funnel / Sparkline / Chart / Sankey 消费。
// 所有数值手工编排出真实波形（早高峰爬升、午间回落），无随机，SSR 稳定。

import type { FlowLink, MetricSeries } from "./types";

/** 24 个时刻标签（每小时一格，覆盖一天）。 */
const HOURS = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, "0")}:00`);

function series(key: string, label: string, unit: string, values: number[]): MetricSeries {
  return { key, label, unit, points: HOURS.map((t, i) => ({ t, v: values[i] ?? 0 })) };
}

// QPS：凌晨低，早高峰 9-11 点冲顶，午后回落，晚高峰小幅回升。
const QPS = [
  6, 4, 3, 3, 5, 9, 18, 34, 52, 68, 72, 66, 48, 41, 45, 53, 58, 61, 70, 64, 49, 33, 21, 12,
];
// P50 延迟（ms）：负载高时上升。
const P50 = [
  340, 320, 310, 315, 360, 420, 560, 740, 920, 1080, 1140, 1020, 760, 700, 720, 820, 880, 910, 1040, 980, 760, 560, 440, 380,
];
// P95 延迟（ms）：拖尾更明显。
const P95 = [
  720, 680, 660, 670, 780, 980, 1380, 1840, 2360, 2760, 2980, 2640, 1880, 1720, 1780, 2080, 2260, 2340, 2720, 2540, 1980, 1380, 1060, 880,
];
// 队列深度（条）：高峰积压。
const QUEUE = [
  2, 1, 0, 1, 3, 8, 22, 46, 71, 96, 108, 88, 51, 42, 47, 63, 72, 79, 102, 86, 54, 28, 14, 6,
];
// 每小时成本（¥）：随吞吐与模型档位走高。
const COST = [
  8, 5, 4, 4, 7, 14, 31, 62, 98, 134, 146, 128, 86, 74, 81, 97, 108, 116, 140, 122, 88, 56, 34, 18,
];

export const METRICS: MetricSeries[] = [
  series("qps", copy("throughputQps"), "QPS", QPS),
  series("p50", copy("p50Latency"), "ms", P50),
  series("p95", copy("p95Latency"), "ms", P95),
  series("queue", copy("queueDepth"), copy("article"), QUEUE),
  series("cost", copy("cost"), "¥/h", COST),
];

/** 按 key 取一条时序的纯数值数组（供 Sparkline）。 */
export function seriesValues(key: string): number[] {
  return METRICS.find((m) => m.key === key)?.points.map((p) => p.v) ?? [];
}

/** 任务处理漏斗（供 Funnel）：涌入 → 路由 → 执行 → 完成。 */
export const FUNNEL_STAGES = [
  { id: "ingress", label: copy("missionsPouringIn"), value: 1280 },
  { id: "routed", label: copy("successfulRouting"), value: 1196 },
  { id: "executing", label: copy("proceedToExecution"), value: 1124 },
  { id: "completed", label: copy("successfullyCompleted"), value: 1043 },
];

/**
 * 桑基流向 links（任务类型 → 路由器 → 执行器）。
 * 三层：左=任务类型，中=智能路由器，右=执行器池。value=分配的任务条数。
 */
export const SANKEY_NODES = [
  // 任务类型（layer 0）
  { id: "src-translate", label: copy("translationCategory"), layer: 0 },
  { id: "src-extract", label: copy("extractionCategory"), layer: 0 },
  { id: "src-rag", label: copy("searchQA"), layer: 0 },
  { id: "src-moderate", label: copy("reviewCategory"), layer: 0 },
  { id: "src-image", label: copy("imageCategory"), layer: 0 },
  { id: "src-orchestrate", label: copy("arrangementCategory"), layer: 0 },
  // 路由器（layer 1）
  { id: "router", label: copy("sixDimensionalSmartRouter"), layer: 1 },
  // 执行器（layer 2）
  { id: "exec-haiku", label: "Haiku 4.5", layer: 2 },
  { id: "exec-sonnet", label: "Sonnet 4.6", layer: 2 },
  { id: "exec-opus", label: "Opus 4.7", layer: 2 },
  { id: "exec-deepseek", label: "DeepSeek V4", layer: 2 },
  { id: "exec-flux", label: copy("scrollFlux"), layer: 2 },
  { id: "exec-agents", label: copy("agentCluster"), layer: 2 },
];

export const SANKEY_LINKS: FlowLink[] = [
  // 任务类型 → 路由器
  { source: "src-translate", target: "router", value: 320 },
  { source: "src-extract", target: "router", value: 248 },
  { source: "src-rag", target: "router", value: 196 },
  { source: "src-moderate", target: "router", value: 172 },
  { source: "src-image", target: "router", value: 88 },
  { source: "src-orchestrate", target: "router", value: 96 },
  // 路由器 → 执行器
  { source: "router", target: "exec-haiku", value: 286 },
  { source: "router", target: "exec-sonnet", value: 264 },
  { source: "router", target: "exec-opus", value: 118 },
  { source: "router", target: "exec-deepseek", value: 198 },
  { source: "router", target: "exec-flux", value: 88 },
  { source: "router", target: "exec-agents", value: 166 },
];
