// 智能选模型：按文件特征命中规则 → 选模型 + 理由 + 预估成本。

export interface FileFeature {
  lang: string;
  lines: number;
  securitySensitive: boolean;
  isTestOrConfig: boolean;
}

export interface RouteDecision {
  modelId: string;
  reason: string;
  estCost: number;
}

export function routeFile(f: FileFeature, opts: { costCap: number } = { costCap: 0.05 }): RouteDecision {
  let decision: RouteDecision;
  if (f.isTestOrConfig) {
    decision = { modelId: "haiku", reason: "测试/配置文件 → 经济模型", estCost: 0.002 + f.lines * 0.00002 };
  } else if (f.securitySensitive) {
    decision = { modelId: "opus", reason: "安全敏感路径 → 最强模型", estCost: 0.02 + f.lines * 0.0002 };
  } else if (f.lines > 300) {
    decision = { modelId: "sonnet", reason: "大文件 → 均衡模型", estCost: 0.01 + f.lines * 0.00006 };
  } else {
    decision = { modelId: "sonnet", reason: "默认 → 均衡模型", estCost: 0.006 + f.lines * 0.00005 };
  }
  // 成本封顶：超 costCap 则降级到经济模型。
  if (decision.estCost > opts.costCap && decision.modelId !== "haiku") {
    return { modelId: "haiku", reason: `${decision.reason}（超成本上限降级）`, estCost: opts.costCap };
  }
  return decision;
}
