// 路由策略规则列表（智能路由页展示 + 决策解释）。按 order 从小到大依次匹配，首条命中即生效。

import type { RoutingRule } from "./types";

export const ROUTING_RULES: RoutingRule[] = [
  {
    id: "rule-p0-safety",
    name: "P0 安全敏感 → 旗舰",
    when: "优先级 = P0 且 能力含 moderate/orchestrate（安全/复杂编排）",
    then: "强制路由至 Opus 4.7，绕过成本权重，保 SLA 与质量",
    enabled: true,
    order: 1,
  },
  {
    id: "rule-image",
    name: "图像任务 → 视觉模型",
    when: "能力含 image",
    then: "路由至 瑚琏绘卷 Flux（唯一具备 image 能力的执行器）",
    enabled: true,
    order: 2,
  },
  {
    id: "rule-rag",
    name: "检索增强 → RAG Agent",
    when: "能力含 rag 且 优先级 ∈ {P0,P1}",
    then: "优先 检索增强 Agent，失败降级至 Sonnet 4.6",
    enabled: true,
    order: 3,
  },
  {
    id: "rule-batch-cheap",
    name: "批量低优 → 低成本池",
    when: "优先级 ∈ {P2,P3} 且 能力 ⊆ {text,translate,extract}",
    then: "优先 DeepSeek V4 / Haiku 4.5，成本权重上调至 0.5",
    enabled: true,
    order: 4,
  },
  {
    id: "rule-budget-cap",
    name: "成本上限保护",
    when: "候选执行器预估花费 > 任务 budgetYuan",
    then: "淘汰超预算候选，回退至预算内最高分执行器；无可用则任务挂起告警",
    enabled: true,
    order: 5,
  },
  {
    id: "rule-default",
    name: "默认 → 均衡主力",
    when: "未命中以上任何规则",
    then: "六维等权打分，通常落在 Sonnet 4.6（均衡）",
    enabled: true,
    order: 6,
  },
];
