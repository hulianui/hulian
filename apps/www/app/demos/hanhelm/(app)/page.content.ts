import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    "overallDispatchOverview": "调度总览",
    "fullLinkSchedulingStatusHeterogeneousTaskIntelligent": "全链路调度态势 · 异构任务智能路由 · 执行器舰队负载 · 截至 06-05 23:00",
    "checkTheAlert": "查看告警",
    "currently": "当前",
    "taskSlaIsNear": "个任务 SLA 临期、",
    "taskExecutionFailedCurrentCost": "个任务执行失败；本时成本 ¥",
    "approachingBudgetThresholdsPayAttentionToScheduling": "接近预算阈值，请关注调度健康度。",
    "missionsOnTheWay": "在途任务",
    "throughputQps": "吞吐 QPS",
    "averageLatency": "平均延迟",
    "slaAchievementRate": "SLA 达成率",
    "failureRate": "失败率",
    "costAtTheTime": "本时成本",
    "taskProcessingFunnel": "任务处理漏斗",
    "incomingRoutingExecutesComplete": "涌入 → 路由 → 执行 → 完成",
    "hQueueDepthCostTrends": "24h 队列深度 · 成本走势",
    "p95Peak": "P95 峰值",
    "queueDepthBar": "队列深度（条）",
    "costH": "成本（¥/h）",
    "throughputQps2": "吞吐 QPS",
    "p50Latency": "P50 延迟",
    "queueDepth": "队列深度",
    "costAtTheTime2": "本时成本",
    "overviewOfActuatorLoad": "执行器负载概览",
    "actuatorPool": "执行器池",
    "realTimeTaskFlow": "实时任务流",
    "taskQueue": "任务队列",
  },
  en: {
    "overallDispatchOverview": "Overall Dispatch Overview",
    "fullLinkSchedulingStatusHeterogeneousTaskIntelligent": "Full-Link Scheduling Status · Heterogeneous Task Intelligent Routing · Executor Fleet Load · As of 06-05 23:00",
    "checkTheAlert": "Check the alert",
    "currently": "Currently",
    "taskSlaIsNear": "Task SLA is near,",
    "taskExecutionFailedCurrentCost": "Task execution failed; Current cost ¥",
    "approachingBudgetThresholdsPayAttentionToScheduling": "Approaching budget thresholds, pay attention to scheduling health.",
    "missionsOnTheWay": "Tasks on the way",
    "throughputQps": "Throughput QPS",
    "averageLatency": "Average latency",
    "slaAchievementRate": "SLA achievement rate",
    "failureRate": "Failure rate",
    "costAtTheTime": "Cost at the time",
    "taskProcessingFunnel": "Task processing funnel",
    "incomingRoutingExecutesComplete": "Incoming → routing → executes → complete",
    "hQueueDepthCostTrends": "24h queue depth · Cost trends",
    "p95Peak": "P95 peak",
    "queueDepthBar": "Queue depth (bar)",
    "costH": "Cost (¥/h)",
    "throughputQps2": "Throughput QPS",
    "p50Latency": "P50 latency",
    "queueDepth": "Queue depth",
    "costAtTheTime2": "Cost at the time",
    "overviewOfActuatorLoad": "Overview of executor load",
    "actuatorPool": "Executor pool",
    "realTimeTaskFlow": "Real-time task flow",
    "taskQueue": "Task queue",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = {
  key: "demo-hanhelm-app-page",
  content: t(content),
};

export default dictionary;
