import { copy } from "./routing-rules.content";
// 路由策略规则列表（智能路由页展示 + 决策解释）。按 order 从小到大依次匹配，首条命中即生效。

import type { RoutingRule } from "./types";

export const ROUTING_RULES: RoutingRule[] = [
  {
    id: "rule-p0-safety",
    name: copy("p0SecuritySensitiveFlagship"),
    when: copy("priorityP0AndCapabilitiesIncludeModerateOrchestrate"),
    then: copy("forcedRoutingToOpusBypassesCostWeights"),
    enabled: true,
    order: 1,
  },
  {
    id: "rule-image",
    name: copy("imageTaskVisualModel"),
    when: copy("abilitiesIncludeImages"),
    then: copy("routingToHulianEmakiFluxTheOnly"),
    enabled: true,
    order: 2,
  },
  {
    id: "rule-rag",
    name: copy("retrievalEnhancementRagAgent"),
    when: copy("abilityIncludesRagAndPriorityP0P1"),
    then: copy("priorityIsToRetrieveEnhancedAgentsFailure"),
    enabled: true,
    order: 3,
  },
  {
    id: "rule-batch-cheap",
    name: copy("lowCostPoolsLowCostBulkPrices"),
    when: copy("priorityP2P3AndAbilityTextTranslate"),
    then: copy("priorityIsGivenToDeepseekV4Haiku"),
    enabled: true,
    order: 4,
  },
  {
    id: "rule-budget-cap",
    name: copy("costCapProtection"),
    when: copy("theCandidateActuatorEstimatesTheCostOf"),
    then: copy("candidatesOverBudgetAreEliminatedAndReverted"),
    enabled: true,
    order: 5,
  },
  {
    id: "rule-default",
    name: copy("defaultBalancedMainForce"),
    when: copy("noneOfTheAboveRulesAreMet"),
    then: copy("sixDimensionalEqualWeightScoreUsuallyAt"),
    enabled: true,
    order: 6,
  },
];
