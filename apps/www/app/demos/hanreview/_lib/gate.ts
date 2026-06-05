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
  if (x.score < t.minScore) reasons.push(`质量分 ${x.score} 低于门禁 ${t.minScore}`);
  if (x.criticalCount > t.maxCritical) reasons.push(`严重问题 ${x.criticalCount} 超过上限 ${t.maxCritical}`);
  if (x.coverage < t.minCoverage) reasons.push(`覆盖率 ${x.coverage}% 低于 ${t.minCoverage}%`);
  return { pass: reasons.length === 0, reasons };
}
