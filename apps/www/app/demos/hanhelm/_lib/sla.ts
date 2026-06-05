// SLA 评估 + 分位数（纯函数）。

export type SlaStatus = "met" | "at-risk" | "violated";

export interface SlaResult {
  status: SlaStatus;
  /** latencyMs / slaMs。slaMs<=0 时为 Infinity 的安全替代（=2，归 violated）。 */
  ratio: number;
  /** 余量毫秒 = slaMs - latencyMs（正=宽裕，负=超标）。 */
  marginMs: number;
}

/**
 * 评估端到端延迟相对 SLA 的健康度。
 * - met：ratio < 0.8
 * - at-risk：0.8 <= ratio <= 1.0
 * - violated：ratio > 1.0
 * slaMs<=0 视为无效目标，按 violated 兜底（不除零）。
 */
export function evaluateSla(latencyMs: number, slaMs: number): SlaResult {
  if (slaMs <= 0) {
    return { status: "violated", ratio: 2, marginMs: -latencyMs };
  }
  const ratio = latencyMs / slaMs;
  const marginMs = slaMs - latencyMs;
  let status: SlaStatus;
  if (ratio > 1) status = "violated";
  else if (ratio >= 0.8) status = "at-risk";
  else status = "met";
  return { status, ratio, marginMs };
}

/**
 * 线性插值分位数（p 取 0-100）。空样本返回 0。
 * 排序后按 (p/100)*(n-1) 定位，做线性插值。
 */
export function percentile(samples: number[], p: number): number {
  if (samples.length === 0) return 0;
  if (samples.length === 1) return samples[0];
  const sorted = [...samples].sort((a, b) => a - b);
  const clampedP = Math.min(Math.max(p, 0), 100);
  const idx = (clampedP / 100) * (sorted.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo];
  const frac = idx - lo;
  return sorted[lo] + (sorted[hi] - sorted[lo]) * frac;
}
