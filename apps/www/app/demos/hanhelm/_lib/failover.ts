// 降级链 failover（纯函数）。

import type { ExecutorHealth } from "../_data/types";

/**
 * 在降级链 chain 中，从 failedId 之后开始，返回第一个 healthy 的执行器 id。
 * - failedId 不在链中 → null
 * - failedId 之后全不健康（offline/degraded/缺失）→ null
 * 仅 health === "healthy" 才作为有效降级目标（degraded 不接新流量）。
 */
export function nextFallback(
  chain: string[],
  failedId: string,
  healthMap: Record<string, ExecutorHealth>,
): string | null {
  const start = chain.indexOf(failedId);
  if (start < 0) return null;
  for (let i = start + 1; i < chain.length; i++) {
    const id = chain[i];
    if (healthMap[id] === "healthy") return id;
  }
  return null;
}
