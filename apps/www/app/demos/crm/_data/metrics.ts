import { customers } from "./customers";
import { opportunities } from "./opportunities";
import { orders } from "./orders";
import { oppStageLabel } from "./status";
import { OPP_STAGES } from "./types";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

// 工作台指标：全部由 mock 数据现算（单一口径，供 Stat/Chart 复用）。
const MONTH_OPEN = "2026-05-01"; // 「本月/近期新增」口径

export const metrics = {
  totalCustomers: customers.length,
  newThisMonth: customers.filter((c) => c.createdAt >= MONTH_OPEN).length,
  dealCustomers: customers.filter((c) => c.status === "已成交").length,
  following: customers.filter((c) => c.status === "跟进中").length,
  pipelineAmount: opportunities
    .filter((o) => o.stage !== "赢单" && o.stage !== "输单")
    .reduce((s, o) => s + o.amount, 0),
  wonAmount: opportunities.filter((o) => o.stage === "赢单").reduce((s, o) => s + o.amount, 0),
  totalRevenue: customers.reduce((s, c) => s + c.amount, 0),
};

/** 近 6 个月趋势：成交额（按订单 createdAt 月聚合，剔除退款）+ 新增客户数。 */
export function monthlyTrend() {
  const months = ["2026-01", "2026-02", "2026-03", "2026-04", "2026-05", "2026-06"];
  return months.map((m) => {
    const revenue = orders
      .filter((o) => o.createdAt.startsWith(m) && o.status !== "已退款")
      .reduce((s, o) => s + o.amount, 0);
    const newCustomers = customers.filter((c) => c.createdAt.startsWith(m)).length;
    const month = DOCS_LOCALE === "en"
      ? new Intl.DateTimeFormat("en", { month: "short", timeZone: "UTC" }).format(new Date(`${m}-01T00:00:00Z`))
      : `${Number(m.slice(5))}月`;
    return { month, 成交额: Math.round(revenue / 10000), 新增客户: newCustomers };
  });
}

/** 商机阶段分布（活跃阶段的商机数，输单不计）。 */
export function stageDistribution() {
  return OPP_STAGES.filter((s) => s !== "输单").map((stage) => ({
    name: oppStageLabel[stage],
    value: opportunities.filter((o) => o.stage === stage).length,
  }));
}

/** 负责人业绩（累计成交额 Top，工作台/设置复用）。 */
export function ownerLeaderboard() {
  const map = new Map<string, number>();
  for (const c of customers) map.set(c.owner, (map.get(c.owner) ?? 0) + c.amount);
  return [...map.entries()]
    .map(([owner, amount]) => ({ owner, amount }))
    .sort((a, b) => b.amount - a.amount);
}
