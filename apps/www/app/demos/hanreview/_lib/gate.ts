import { copy } from "./gate.content";
// 质量门禁判定：阈值 vs 审查指标 → pass/block + 阻断原因。

export interface GateThreshold {
  minScore: number;
  maxCritical: number;
  minCoverage: number;
}

export interface GateInput {
  score: number;
  criticalCount: number;
  coverage: number;
}

export function evalGate(t: GateThreshold, x: GateInput): { pass: boolean; reasons: string[] } {
  const reasons: string[] = [];
  if (x.score < t.minScore) reasons.push(copy("qualityScoreValueLowerThanAccessControl", x.score, t.minScore));
  if (x.criticalCount > t.maxCritical) reasons.push(copy("seriousIssuesValueExceedingTheLimitValue", x.criticalCount, t.maxCritical));
  if (x.coverage < t.minCoverage) reasons.push(copy("coverageOfValueIsBelowValue", x.coverage, t.minCoverage));
  return { pass: reasons.length === 0, reasons };
}
