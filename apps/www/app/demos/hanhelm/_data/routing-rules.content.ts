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
    "priorityP0AndCapabilitiesIncludeModerateOrchestrate": "Priority = P0 and capabilities include moderation or orchestration",
    "forcedRoutingToOpusBypassesCostWeights": "Route directly to Opus 4.7, bypassing cost weights to protect SLA and quality",
    "imageTaskVisualModel": "Image task → Image model",
    "abilitiesIncludeImages": "Capabilities include image generation",
    "routingToHulianEmakiFluxTheOnly": "Route to Hulian Image Flux, the only image-capable executor",
    "retrievalEnhancementRagAgent": "Retrieval-augmented task → RAG Agent",
    "abilityIncludesRagAndPriorityP0P1": "Capabilities include RAG and priority is P0 or P1",
    "priorityIsToRetrieveEnhancedAgentsFailure": "Prefer the RAG Agent; on failure, fall back to Sonnet 4.6",
    "lowCostPoolsLowCostBulkPrices": "Batch work → Low-cost pool",
    "priorityP2P3AndAbilityTextTranslate": "Priority is P2 or P3 and capabilities are limited to text, translation, or extraction",
    "priorityIsGivenToDeepseekV4Haiku": "Prefer DeepSeek V4 or Haiku 4.5 and raise the cost weight to 0.5",
    "costCapProtection": "Cost cap protection",
    "theCandidateActuatorEstimatesTheCostOf": "Candidate executor's estimated cost exceeds task.budgetYuan",
    "candidatesOverBudgetAreEliminatedAndReverted": "Exclude over-budget candidates and select the highest-scoring executor within budget. If none remain, pause the task and raise an alert.",
    "defaultBalancedMainForce": "Default → Balanced executor",
    "noneOfTheAboveRulesAreMet": "None of the above rules are met",
    "sixDimensionalEqualWeightScoreUsuallyAt": "Equal weighting usually selects Sonnet 4.6 as the balanced option.",
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
