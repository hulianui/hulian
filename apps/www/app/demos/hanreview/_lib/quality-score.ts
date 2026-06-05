import type { Severity } from "../_data/types";

// 质量分：100 − Σ(severity 权重 × 计数)，clamp 0-100。
const WEIGHT: Record<Severity, number> = { critical: 25, major: 10, minor: 4, info: 1 };

export function qualityScore(counts: Partial<Record<Severity, number>>): number {
  const penalty = (Object.keys(WEIGHT) as Severity[]).reduce(
    (s, k) => s + WEIGHT[k] * (counts[k] ?? 0),
    0,
  );
  return Math.max(0, Math.min(100, 100 - penalty));
}

/** 从一组 severity 统计计数。 */
export function countBySeverity(severities: Severity[]): Record<Severity, number> {
  const acc: Record<Severity, number> = { critical: 0, major: 0, minor: 0, info: 0 };
  for (const s of severities) acc[s] += 1;
  return acc;
}
