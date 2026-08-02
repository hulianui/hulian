import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    "p0SecuritySensitiveFlagship": "P0 安全敏感 → 旗舰",
    "priorityP0AndCapabilitiesIncludeModerateOrchestrate": "优先级 = P0 且 能力含 moderate/orchestrate（安全/复杂编排）",
    "forcedRoutingToOpusBypassesCostWeights": "强制路由至 Opus 4.7，绕过成本权重，保 SLA 与质量",
    "imageTaskVisualModel": "图像任务 → 视觉模型",
    "abilitiesIncludeImages": "能力含 image",
    "routingToHulianEmakiFluxTheOnly": "路由至 瑚琏绘卷 Flux（唯一具备 image 能力的执行器）",
    "retrievalEnhancementRagAgent": "检索增强 → RAG Agent",
    "abilityIncludesRagAndPriorityP0P1": "能力含 rag 且 优先级 ∈ {P0,P1}",
    "priorityIsToRetrieveEnhancedAgentsFailure": "优先 检索增强 Agent，失败降级至 Sonnet 4.6",
    "lowCostPoolsLowCostBulkPrices": "批量低优 → 低成本池",
    "priorityP2P3AndAbilityTextTranslate": "优先级 ∈ {P2,P3} 且 能力 ⊆ {text,translate,extract}",
    "priorityIsGivenToDeepseekV4Haiku": "优先 DeepSeek V4 / Haiku 4.5，成本权重上调至 0.5",
    "costCapProtection": "成本上限保护",
    "theCandidateActuatorEstimatesTheCostOf": "候选执行器预估花费 > 任务 budgetYuan",
    "candidatesOverBudgetAreEliminatedAndReverted": "淘汰超预算候选，回退至预算内最高分执行器；无可用则任务挂起告警",
    "defaultBalancedMainForce": "默认 → 均衡主力",
    "noneOfTheAboveRulesAreMet": "未命中以上任何规则",
    "sixDimensionalEqualWeightScoreUsuallyAt": "六维等权打分，通常落在 Sonnet 4.6（均衡）",
  },
  en: {
    "p0SecuritySensitiveFlagship": "P0 security-sensitive → flagship",
    "priorityP0AndCapabilitiesIncludeModerateOrchestrate": "Priority = P0 and capabilities include moderate/orchestrate (secure/complex orchestration)",
    "forcedRoutingToOpusBypassesCostWeights": "Forced routing to Opus 4.7 bypasses cost weights and protects SLA and quality",
    "imageTaskVisualModel": "Image Task → Visual Model",
    "abilitiesIncludeImages": "Abilities include images",
    "routingToHulianEmakiFluxTheOnly": "Routing to Hulian Emaki Flux (the only executor with image capability)",
    "retrievalEnhancementRagAgent": "Retrieval enhancement → RAG Agent",
    "abilityIncludesRagAndPriorityP0P1": "Ability includes rag and priority ∈ {P0, P1}",
    "priorityIsToRetrieveEnhancedAgentsFailure": "Priority is to retrieve enhanced agents; fall back on failure to Sonnet 4.6",
    "lowCostPoolsLowCostBulkPrices": "Low-cost pools → low-cost bulk prices",
    "priorityP2P3AndAbilityTextTranslate": "Priority ∈ {P2, P3} and Ability ⊆ {text, translate, extract}",
    "priorityIsGivenToDeepseekV4Haiku": "Priority is given to DeepSeek V4 / Haiku 4.5, with cost weights raised to 0.5",
    "costCapProtection": "Cost cap protection",
    "theCandidateActuatorEstimatesTheCostOf": "The candidate executor estimates the cost of > tasks budgetYuan",
    "candidatesOverBudgetAreEliminatedAndReverted": "Candidates over-budget are eliminated and reverted to the highest-scoring executor within the budget; If unavailable, the task will be suspended with an alarm",
    "defaultBalancedMainForce": "Default → Balanced main force",
    "noneOfTheAboveRulesAreMet": "None of the above rules are met",
    "sixDimensionalEqualWeightScoreUsuallyAt": "Six-dimensional equal weight score, usually at Sonnet 4.6 (equilibrium)",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = {
  key: "demo-hanhelm-data-routing-rules",
  content: t(content),
};

export default dictionary;
