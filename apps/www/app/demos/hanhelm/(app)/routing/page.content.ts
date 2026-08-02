import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    "intelligentRouting": "智能路由",
    "taskOption": "{0}（{1} · {2}）",
    "sangyFlowDirectionSixMaintenanceWeightsDecision": "桑基流向 · 六维权重 · 决策回放",
    "sixDimensionalWeightingEngine": "六维加权引擎",
    "distributionAndDistribution": "派发流向",
    "taskTypeSixDimensionalSmartRouterActuator": "任务类型 → 六维智能路由器 → 执行器池；流带宽度 = 派发任务条数占比",
    "toEnter": "：入",
    "andLeft": "· 出",
    "article": "条",
    "nearlyHourClickNodesToCheckTraffic": "近 1h · 点击节点看流量",
    "article2": "条",
    "theSixPillarsHoldGreatWeight": "六维权重",
    "adjustAnyDimensionTheDecisionPlaybackOn": "调整任一维 → 右侧决策回放按 scoreExecutors 实时重算",
    "routingStrategyRules": "路由策略规则",
    "matchSequentiallyByOrderTheFirstHit": "按 order 依次匹配，首条命中即生效（演示开关）",
    "activated": "启用",
    "deactivated": "停用",
    "conditions": "条件",
    "action": "动作",
    "valueEnableTheSwitch": "{0} 启用开关",
    "routingDecisionReview": "路由决策回放",
    "scoreEachCandidateActuatorBySixDimensional": "逐候选执行器的六维分项打分；淘汰者标灰 + 原因，选中者高亮",
    "capabilityRequirements": "能力需求：",
    "budget": "预算",
    "engineJudgment": "引擎裁决：",
    "costLatencyDistribution": "成本 / 延迟分布",
    "mixedUnitPriceForEachActuatorAnd": "各执行器混合单价与典型延迟（同轴归一指数，越低越优）",
  },
  en: {
    "intelligentRouting": "Intelligent routing",
    "taskOption": "{0} ({1} · {2})",
    "sangyFlowDirectionSixMaintenanceWeightsDecision": "Traffic flow · Six routing weights · Decision replay",
    "sixDimensionalWeightingEngine": "Six-dimensional weighting engine",
    "distributionAndDistribution": "Routing distribution",
    "taskTypeSixDimensionalSmartRouterActuator": "Task type → Six-weight router → Executor pool; band width represents assigned task share",
    "toEnter": ": incoming ",
    "andLeft": " · remaining ",
    "article": "tasks",
    "nearlyHourClickNodesToCheckTraffic": "Last hour · Select a node to inspect traffic",
    "article2": "tasks",
    "theSixPillarsHoldGreatWeight": "Six routing weights",
    "adjustAnyDimensionTheDecisionPlaybackOn": "Adjust any dimension → the decision playback on the right is recalculated in real time using scoreExecutors",
    "routingStrategyRules": "Routing strategy rules",
    "matchSequentiallyByOrderTheFirstHit": "Match sequentially by order; the first hit takes effect (demo switch)",
    "activated": "Activated",
    "deactivated": "Deactivated",
    "conditions": "Conditions",
    "action": "Action",
    "valueEnableTheSwitch": "{0} Enable the switch",
    "routingDecisionReview": "Routing decision review",
    "scoreEachCandidateActuatorBySixDimensional": "Score every candidate across six dimensions. Excluded executors show their reason; the selected executor is highlighted.",
    "capabilityRequirements": "Required capabilities:",
    "budget": "Budget",
    "engineJudgment": "Routing decision:",
    "costLatencyDistribution": "Cost/latency distribution",
    "mixedUnitPriceForEachActuatorAnd": "Mixed unit price for each executor and typical delay (normalized comparison, lower is better)",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = {
  key: "demo-hanhelm-app-routing-page",
  content: t(content),
};

export default dictionary;
