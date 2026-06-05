// 智能路由引擎（纯函数，无副作用、无 Date.now/Math.random）。
// 对每个执行器做「能力 + 成本 + 延迟 + 负载 + 优先级 + SLA」六维归一化打分并加权，选综合分最高者。
// 能力子集不满足直接淘汰（total=0、记 eliminated）。

import type {
  Capability,
  Executor,
  Priority,
  RoutingCandidate,
  RoutingDecision,
  SixWeights,
  Task,
} from "../_data/types";

/** 六维默认权重：各占约 1/6，和为 1。 */
export const DEFAULT_WEIGHTS: SixWeights = {
  capability: 1 / 6,
  cost: 1 / 6,
  latency: 1 / 6,
  load: 1 / 6,
  priority: 1 / 6,
  sla: 1 / 6,
};

/** 优先级数值映射：P0 最高(4)。用于「高优任务偏好高能力执行器」打分。 */
const PRIORITY_RANK: Record<Priority, number> = { P0: 4, P1: 3, P2: 2, P3: 1 };

/** 单执行器综合「每 1k 输入+输出」混合价（用于成本归一化）。 */
function blendedPrice(e: Executor): number {
  return e.pricePer1kIn + e.pricePer1kOut;
}

/** 在 [min,max] 间把 value 反向归一化（越小越好 → 越接近 1）。range=0 时返回 1。 */
function invNorm(value: number, min: number, max: number): number {
  if (max <= min) return 1;
  const clamped = Math.min(Math.max(value, min), max);
  return 1 - (clamped - min) / (max - min);
}

/**
 * 对候选执行器集合按 task 做六维打分。
 * - 能力：执行器 capabilities 是否覆盖 task.capabilities 全集；不满足 → eliminated。
 *   覆盖度得分 = 1（满足才进入打分，故恒为 1，作为「能力维」基线，用余量微调）。
 * - 成本/延迟/负载：越低分越高（在候选集内做 min-max 反向归一化）。
 * - 优先级：执行器能力宽度 × 任务优先级权重归一（高优任务偏好能力更全的执行器）。
 * - SLA：执行器延迟相对任务 slaMs 的余量比例（越宽裕越高）。
 */
export function scoreExecutors(
  task: Task,
  executors: Executor[],
  weights: SixWeights,
): RoutingDecision {
  const required = task.capabilities;
  const covers = (e: Executor) =>
    required.every((c: Capability) => e.capabilities.includes(c));

  // 仅用「合格 + 在线」执行器构建归一化区间。
  const eligible = executors.filter((e) => covers(e) && e.health !== "offline");

  const prices = eligible.map(blendedPrice);
  const latencies = eligible.map((e) => e.latencyMs);
  const loads = eligible.map((e) => e.load);
  const capWidths = eligible.map((e) => e.capabilities.length);

  const minP = Math.min(...prices);
  const maxP = Math.max(...prices);
  const minL = Math.min(...latencies);
  const maxL = Math.max(...latencies);
  const minLoad = Math.min(...loads);
  const maxLoad = Math.max(...loads);
  const maxCap = Math.max(...capWidths, 1);

  const prioWeight = PRIORITY_RANK[task.priority] / 4; // 0.25..1

  const candidates: RoutingCandidate[] = executors.map((e) => {
    // 淘汰：能力不满足 或 离线。
    if (!covers(e)) {
      const missing = required.filter((c) => !e.capabilities.includes(c));
      return {
        executorId: e.id,
        scores: { capability: 0, cost: 0, latency: 0, load: 0, priority: 0, sla: 0 },
        total: 0,
        eliminated: `能力不满足: ${missing.join("/")}`,
      };
    }
    if (e.health === "offline") {
      return {
        executorId: e.id,
        scores: { capability: 0, cost: 0, latency: 0, load: 0, priority: 0, sla: 0 },
        total: 0,
        eliminated: "执行器离线",
      };
    }

    const capability = 1; // 已满足全集
    const cost = invNorm(blendedPrice(e), minP, maxP);
    const latency = invNorm(e.latencyMs, minL, maxL);
    const load = invNorm(e.load, minLoad, maxLoad);
    // 高优任务偏好能力更全的执行器；低优任务该维贡献被压低。
    const priority = (e.capabilities.length / maxCap) * prioWeight;
    // SLA 余量：(sla - latency)/sla，裁剪到 [0,1]。
    const slaMargin = task.slaMs > 0 ? (task.slaMs - e.latencyMs) / task.slaMs : 0;
    const sla = Math.min(Math.max(slaMargin, 0), 1);

    const scores = { capability, cost, latency, load, priority, sla };
    const total =
      capability * weights.capability +
      cost * weights.cost +
      latency * weights.latency +
      load * weights.load +
      priority * weights.priority +
      sla * weights.sla;

    return { executorId: e.id, scores, total };
  });

  // 选 total 最高（且未淘汰）者。
  let chosenId: string | null = null;
  let best = -1;
  for (const c of candidates) {
    if (c.eliminated) continue;
    if (c.total > best) {
      best = c.total;
      chosenId = c.executorId;
    }
  }

  const chosen = executors.find((e) => e.id === chosenId);
  const reason = chosen
    ? `综合六维最优：${chosen.name}（能力匹配，综合分 ${(best * 100).toFixed(0)}）`
    : "无满足能力要求的在线执行器，任务进入等待重试。";

  return { taskId: task.id, candidates, chosenId, reason, failovers: [] };
}
